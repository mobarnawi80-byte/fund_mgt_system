import { describe, it, expect } from 'vitest';
import { UserRole, Permission, UserContext } from '../src/core/rbac/types';
import { RBACAuthorizer } from '../src/core/rbac/authorizer';
import { AdvancedLoanService } from '../src/core/loans/advanced-loan-service';
import { WithdrawalService } from '../src/core/withdrawals/withdrawal-service';
import { ContributionService, MemberMonthlyContributionRecord } from '../src/core/contributions/contribution-service';
import { ApprovalEngine } from '../src/core/approvals/approval-engine';

describe('End-to-End Workflow Verification: Member, Finance & Committee', () => {
  // Actors
  const memberUser: UserContext = { userId: 'usr-mem-01', memberId: 'mem-01', fullName: 'Dr. Aliyu Mohammed', email: 'aliyu@ministry.gov.ng', role: UserRole.MEMBER, staffId: 'MIN-EMP-1042' };
  const financeOfficer: UserContext = { userId: 'usr-fo-01', memberId: 'mem-fo-01', fullName: 'Mallam Ibrahim (FO)', email: 'ibrahim@ministry.gov.ng', role: UserRole.FINANCE_OFFICER, staffId: 'MIN-FO-01' };
  const committeeApprover: UserContext = { userId: 'usr-comm-01', fullName: 'Dr. Sarah Aliyu (Chair)', email: 'sarah@ministry.gov.ng', role: UserRole.APPROVING_OFFICER };

  describe('1. Member Lifecycle Workflows', () => {
    it('should permit member to view profile, savings history and apply for eligible loan', () => {
      // 1. Check permissions
      expect(RBACAuthorizer.hasPermission(memberUser.role, Permission.PROFILE_VIEW_SELF)).toBe(true);
      expect(RBACAuthorizer.hasPermission(memberUser.role, Permission.LOAN_APPLY)).toBe(true);
      expect(RBACAuthorizer.hasPermission(memberUser.role, Permission.LOANS_APPROVE)).toBe(false);

      // 2. Loan eligibility check
      const accumulatedSavings = 1200000; // ₦1.2M
      const requestedLoan = 600000; // ₦600k (50% of savings)

      const calculation = AdvancedLoanService.calculateEligibility(
        accumulatedSavings,
        requestedLoan,
        12
      );

      expect(calculation.isEligible).toBe(true);
      expect(calculation.maximumEligibleLoan).toBe(1200000);
      expect(calculation.interestRate).toBe(0.0);
      expect(calculation.monthlyRepayment).toBe(50000); // 600k / 12

      // 3. Create Loan Application
      const loanApp = AdvancedLoanService.submitApplication({
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        applicantName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-14',
        accumulatedSavings,
        loanType: 'SALARY_ADVANCE',
        requestedAmount: 600000,
        tenorMonths: 12,
        purpose: 'Home renovation repair',
      });
      expect(loanApp.status).toBe('SUBMITTED');
    });

    it('should permit member to request withdrawal within available savings', () => {
      const accumulatedSavings = 1500000;
      const activeLoanDebt = 200000;
      const requestedWithdrawal = 500000;

      const eligibility = WithdrawalService.checkEligibility(
        accumulatedSavings,
        activeLoanDebt,
        requestedWithdrawal
      );

      expect(eligibility.isEligible).toBe(true);
      expect(eligibility.maxAllowableWithdrawal).toBe(1300000); // 1.5M - 200k
    });
  });

  describe('2. Finance Officer Workflows', () => {
    it('should allow Finance Officer to record manual payment and verify', () => {
      expect(RBACAuthorizer.hasPermission(financeOfficer.role, Permission.PAYROLL_IMPORT)).toBe(true);
      expect(RBACAuthorizer.hasPermission(financeOfficer.role, Permission.PAYROLL_RECONCILE)).toBe(true);

      const existingRecord: MemberMonthlyContributionRecord = {
        id: 'rec-05',
        memberId: 'mem-05',
        employeeId: 'MIN-EMP-5118',
        memberName: 'Usman Garba',
        department: 'Procurement',
        gradeLevel: 'GL-10',
        contributionMonth: '2026-08',
        expectedContribution: 30000,
        actualContribution: 0,
        difference: -30000,
        paymentStatus: 'NOT_PAID',
        verificationStatus: 'PENDING_VERIFICATION',
        history: [],
      };

      const manualRecord = ContributionService.recordManualPayment(
        existingRecord,
        {
          amount: 30000,
          paymentDate: '2026-08-14',
          transactionReference: 'NIBSS-TRF-20260814-99881',
          supportingNote: 'Direct bank transfer receipt submitted',
          recordedByUserId: financeOfficer.userId,
        }
      );

      expect(manualRecord.verificationStatus).toBe('VERIFIED');
      expect(manualRecord.actualContribution).toBe(30000);
      expect(manualRecord.paymentStatus).toBe('PAID');
    });
  });

  describe('3. Committee Member Workflows & Maker-Checker Isolation', () => {
    it('should allow committee member to approve member loan with audit trail', () => {
      expect(RBACAuthorizer.hasPermission(committeeApprover.role, Permission.LOANS_APPROVE)).toBe(true);

      const loanApp = AdvancedLoanService.submitApplication({
        memberId: 'mem-02',
        employeeId: 'MIN-EMP-2081',
        applicantName: 'Mustapha Danjuma',
        department: 'Human Resources',
        gradeLevel: 'GL-12',
        accumulatedSavings: 800000,
        loanType: 'EMERGENCY_LOAN',
        requestedAmount: 400000,
        tenorMonths: 10,
        purpose: 'Family emergency',
      });

      const approvedLoan = AdvancedLoanService.recordCommitteeDecision(
        loanApp,
        { id: committeeApprover.userId, name: committeeApprover.fullName || 'Chair', role: 'Approving Officer' },
        'APPROVED',
        'Approved in accordance with 0% interest credit policy'
      );

      expect(approvedLoan.status).toBe('APPROVED');
      expect(approvedLoan.committeeDecision).toBeDefined();
      expect(approvedLoan.committeeDecision?.decision).toBe('APPROVED');
    });

    it('should strictly BLOCK finance officer from approving a transaction they originated (SoD)', () => {
      const approvalReq = ApprovalEngine.createRequest({
        requestType: 'ADJUSTMENT',
        entityId: 'pay-001',
        applicantMemberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        applicantName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        requestedAmount: 50000,
        memberSavingsBalance: 1200000,
        currentLoanBalance: 0,
        createdByUserId: financeOfficer.userId, // Originated by Finance Officer
        createdByName: financeOfficer.fullName || 'FO',
        supportingNotes: 'Manual payment verification',
      });

      // Finance Officer attempts to approve own creation -> MUST FAIL
      expect(() => {
        ApprovalEngine.recordDecision(
          approvalReq,
          financeOfficer.userId,
          financeOfficer.fullName || 'FO',
          'Approving Officer',
          'APPROVE',
          'Self-approving my own entry'
        );
      }).toThrowError(/Segregation of Duties Violation/i);
    });
  });
});
