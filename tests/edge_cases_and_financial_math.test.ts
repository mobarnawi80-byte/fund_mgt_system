import { describe, it, expect } from 'vitest';
import { AdvancedPayrollService, RawPayrollRecord, RegisteredMember } from '../src/core/payroll/advanced-reconciliation';
import { AdvancedLoanService } from '../src/core/loans/advanced-loan-service';
import { WithdrawalService } from '../src/core/withdrawals/withdrawal-service';
import { ContributionService } from '../src/core/contributions/contribution-service';
import { FinancialLifecycleEngine, FinancialLifecycleTransaction } from '../src/core/security/financial-lifecycle';

describe('Exhaustive Edge Cases & Financial Precision Verification', () => {
  const registeredMembers: RegisteredMember[] = [
    { id: 'mem-01', employeeId: 'MIN-EMP-1042', fullName: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', monthlyContribution: 50000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
    { id: 'mem-02', employeeId: 'MIN-EMP-2081', fullName: 'Mrs. Folashade Adeleke', department: 'Human Resources', gradeLevel: 'GL-12', monthlyContribution: 30000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
    { id: 'mem-03', employeeId: 'MIN-EMP-3015', fullName: 'Engr. Emeka Okonkwo', department: 'Planning & Research', gradeLevel: 'GL-13', monthlyContribution: 40000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  ];

  describe('Edge Case 1: Duplicate Contribution Records in Same Batch', () => {
    it('should detect duplicate records for same employee in single payroll batch', () => {
      const records: RawPayrollRecord[] = [
        { rowNumber: 1, employeeId: 'MIN-EMP-1042', name: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', contribution: 50000, month: '2026-08' },
        { rowNumber: 2, employeeId: 'MIN-EMP-1042', name: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', contribution: 50000, month: '2026-08' }, // DUPLICATE
      ];

      const report = AdvancedPayrollService.reconcile(records, registeredMembers, '2026-08', 'test_dup.xlsx');
      expect(report.duplicateRecordsCount).toBe(1);
      expect(report.exceptions.some(e => e.type === 'IN-FILE_DUPLICATE')).toBe(true);
    });
  });

  describe('Edge Case 2: Missing Member (Unmatched Employee ID)', () => {
    it('should flag payroll records for non-registered employees as UNMATCHED', () => {
      const records: RawPayrollRecord[] = [
        { rowNumber: 1, employeeId: 'UNKNOWN-EMP-9999', name: 'Unknown Ghost Worker', department: 'Audit', gradeLevel: 'GL-10', contribution: 25000, month: '2026-08' },
      ];

      const report = AdvancedPayrollService.reconcile(records, registeredMembers, '2026-08', 'test_unmatched.xlsx');
      expect(report.unmatchedEmployeesCount).toBe(1);
      expect(report.exceptions.some(e => e.type === 'UNMATCHED_EMPLOYEE')).toBe(true);
    });
  });

  describe('Edge Case 3: Missing Payroll Record for Registered Member', () => {
    it('should identify registered members omitted from incoming payroll deduction', () => {
      // Only Dr. Aliyu is present, Mrs. Adeleke and Engr. Okonkwo are missing
      const records: RawPayrollRecord[] = [
        { rowNumber: 1, employeeId: 'MIN-EMP-1042', name: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', contribution: 50000, month: '2026-08' },
      ];

      const report = AdvancedPayrollService.reconcile(records, registeredMembers, '2026-08', 'test_missing.xlsx');
      expect(report.missingContributionsCount).toBe(2);
      expect(report.exceptions.filter(e => e.type === 'MISSING_FROM_PAYROLL').length).toBe(2);
    });
  });

  describe('Edge Case 4: Partial Contribution (Under-deduction Variance)', () => {
    it('should flag contribution under-deduction variance', () => {
      // Dr. Aliyu expects 50,000 but payroll only deducted 20,000
      const records: RawPayrollRecord[] = [
        { rowNumber: 1, employeeId: 'MIN-EMP-1042', name: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', contribution: 20000, month: '2026-08' },
      ];

      const singleMemberRegistry = [registeredMembers[0]]; // Expected: 50,000
      const report = AdvancedPayrollService.reconcile(records, singleMemberRegistry, '2026-08', 'test_partial.xlsx');
      expect(report.exceptions.some(e => e.type === 'INCORRECT_AMOUNT')).toBe(true);
      expect(report.totalDifference).toBe(-30000); // 20k - 50k = -30k
    });
  });

  describe('Edge Case 5: Overpayment (Contribution higher than expectation)', () => {
    it('should classify member with higher deduction and record positive variance', () => {
      const records: RawPayrollRecord[] = [
        { rowNumber: 1, employeeId: 'MIN-EMP-1042', name: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', contribution: 75000, month: '2026-08' }, // +25k
      ];

      const singleMemberRegistry = [registeredMembers[0]]; // Expected: 50,000
      const report = AdvancedPayrollService.reconcile(records, singleMemberRegistry, '2026-08', 'test_over.xlsx');
      expect(report.totalDifference).toBe(25000); // 75k - 50k = +25k
    });
  });

  describe('Edge Case 6: Loan Application Exceeding Member Accumulated Savings', () => {
    it('should STRICTLY reject loan applications where requested principal > savings balance', () => {
      const accumulatedSavings = 500000;
      const requestedExcessiveLoan = 700000; // ₦700k > ₦500k (140% of savings)

      const calculation = AdvancedLoanService.calculateEligibility(
        accumulatedSavings,
        requestedExcessiveLoan,
        12
      );

      expect(calculation.isEligible).toBe(false);
      expect(calculation.violations.some(r => r.includes('exceeds maximum eligible accumulated savings limit'))).toBe(true);
    });
  });

  describe('Edge Case 7: Withdrawal Greater Than Net Available Balance', () => {
    it('should reject withdrawal where requested amount > available savings less active loan debt', () => {
      const accumulatedSavings = 1000000; // ₦1,000,000
      const activeLoanDebt = 400000;      // ₦400,000
      // Net allowable = ₦600,000
      const excessiveWithdrawal = 800000; // ₦800,000 > ₦600,000

      const result = WithdrawalService.checkEligibility(
        accumulatedSavings,
        activeLoanDebt,
        excessiveWithdrawal
      );

      expect(result.isEligible).toBe(false);
      expect(result.violations.some(r => r.includes('exceeds maximum allowable net savings balance'))).toBe(true);
    });
  });

  describe('Edge Case 8: Loan Repayment and Debt Tracking', () => {
    it('should record monthly loan repayment and track balance reduction', () => {
      let activeLoan = AdvancedLoanService.submitApplication({
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        applicantName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-14',
        accumulatedSavings: 1000000,
        loanType: 'SALARY_ADVANCE',
        requestedAmount: 100000,
        tenorMonths: 2,
        purpose: 'Test loan',
      });

      // Approve and disburse
      activeLoan = AdvancedLoanService.recordCommitteeDecision(activeLoan, { id: 'usr-comm-01', name: 'Chair', role: 'Approver' }, 'APPROVED', 'OK');
      activeLoan = AdvancedLoanService.disburseLoan(activeLoan, 'TX-DISB-001', '2026-08');

      // First repayment of ₦50,000
      const pay1 = AdvancedLoanService.processRepayment(activeLoan, 50000, '2026-08', 'PAYROLL-AUG-1042');
      activeLoan = pay1.updatedLoan;
      expect(activeLoan.outstandingBalance).toBe(50000);
      expect(activeLoan.status).toBe('ACTIVE');

      // Second repayment of ₦50,000 (Fully Paid)
      const pay2 = AdvancedLoanService.processRepayment(activeLoan, 50000, '2026-09', 'PAYROLL-SEP-1042');
      activeLoan = pay2.updatedLoan;
      expect(activeLoan.outstandingBalance).toBe(0);
      expect(activeLoan.status).toBe('FULLY_REPAID');
    });
  });

  describe('Edge Case 9 & 10: Failed Payments and Validation Errors', () => {
    it('should reject manual payments with zero or negative amounts', () => {
      const dummyRecord = {
        id: 'rec-01',
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        memberName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-14',
        contributionMonth: '2026-08',
        expectedContribution: 50000,
        actualContribution: 0,
        difference: -50000,
        paymentStatus: 'NOT_PAID' as const,
        verificationStatus: 'PENDING_VERIFICATION' as const,
        history: [],
      };

      expect(() => {
        ContributionService.recordManualPayment(
          dummyRecord,
          {
            amount: -5000, // Negative amount
            paymentDate: '2026-08-14',
            transactionReference: 'REF-INVALID',
            supportingNote: 'Invalid payment',
            recordedByUserId: 'usr-fo-01',
          }
        );
      }).toThrow();
    });
  });

  describe('Edge Case 11: Reversed Transactions Immutability', () => {
    it('should prevent double reversal of an already reversed transaction', () => {
      const originalTx: FinancialLifecycleTransaction = {
        id: 'tx-rev-test',
        transactionReference: 'TX-REV-001',
        lifecycleState: 'POSTED',
        transactionType: 'CONTRIBUTION',
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        memberName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        debitAccountCode: '1010',
        creditAccountCode: '2010',
        amount: 50000,
        description: 'Test entry',
        createdAt: '2026-08-14',
        createdByUserId: 'usr-fo-01',
        isReversed: false,
      };

      // First reversal succeeds
      const { updatedOriginalTx } = FinancialLifecycleEngine.reversePostedTransaction(
        originalTx,
        'usr-super-admin',
        'Authorized audit adjustment #102938'
      );
      expect(updatedOriginalTx.isReversed).toBe(true);

      // Second reversal on same record MUST throw error
      expect(() => {
        FinancialLifecycleEngine.reversePostedTransaction(
          updatedOriginalTx,
          'usr-super-admin',
          'Second attempt to reverse'
        );
      }).toThrow();
    });
  });
});
