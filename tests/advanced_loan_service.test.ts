import { describe, it, expect } from 'vitest';
import { 
  AdvancedLoanService, 
  ComprehensiveLoanEntity 
} from '../src/core/loans/advanced-loan-service';

describe('Comprehensive Loan Management System & Lifecycle State Machine', () => {
  const accumulatedSavings = 1000000; // ₦1,000,000

  describe('1. Loan Eligibility & Constraint Calculations', () => {
    it('should calculate max eligible loan, monthly repayment, and 0% interest', () => {
      const eligibility = AdvancedLoanService.calculateEligibility(accumulatedSavings, 600000, 12);

      expect(eligibility.isEligible).toBe(true);
      expect(eligibility.maximumEligibleLoan).toBe(1000000);
      expect(eligibility.requestedLoan).toBe(600000);
      expect(eligibility.monthlyRepayment).toBe(50000); // 600k / 12
      expect(eligibility.numberOfInstallments).toBe(12);
      expect(eligibility.interestRate).toBe(0.0);
      expect(eligibility.savingsBuffer).toBe(400000);
    });

    it('should strictly prevent requesting more than the accumulated savings ceiling', () => {
      const invalidEligibility = AdvancedLoanService.calculateEligibility(accumulatedSavings, 1200000, 12);

      expect(invalidEligibility.isEligible).toBe(false);
      expect(invalidEligibility.violations[0]).toContain('exceeds maximum eligible accumulated savings limit');
    });
  });

  describe('2. Full 10-Stage Loan Lifecycle Workflow (End-to-End)', () => {
    let loan: ComprehensiveLoanEntity;

    it('Stage 1 & 2 & 3: Member applies, system validates and transitions to SUBMITTED', () => {
      loan = AdvancedLoanService.submitApplication({
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        applicantName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-14',
        accumulatedSavings,
        loanType: 'SALARY_ADVANCE',
        requestedAmount: 480000,
        tenorMonths: 12,
        purpose: 'Residential tenancy rent advance',
      });

      expect(loan.status).toBe('SUBMITTED');
      expect(loan.originalLoanAmount).toBe(480000);
      expect(loan.monthlyRepayment).toBe(40000);
      expect(loan.totalAmountRepaid).toBe(0);
      expect(loan.outstandingBalance).toBe(480000);
      expect(loan.installmentsCompleted).toBe(0);
      expect(loan.installmentsRemaining).toBe(12);
    });

    it('Stage 4: Committee initiates review and transitions to UNDER_REVIEW', () => {
      loan = AdvancedLoanService.startCommitteeReview(loan);
      expect(loan.status).toBe('UNDER_REVIEW');
    });

    it('Stage 5 & 6: Committee approves with mandatory audit log and transitions to APPROVED', () => {
      loan = AdvancedLoanService.recordCommitteeDecision(
        loan,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        'APPROVED',
        'Applicant savings of ₦1,000,000 exceeds requested ₦480,000. Verified compliant.'
      );

      expect(loan.status).toBe('APPROVED');
      expect(loan.committeeDecision).toBeDefined();
      expect(loan.committeeDecision?.approverName).toBe('Dr. Sarah Aliyu');
      expect(loan.committeeDecision?.decision).toBe('APPROVED');
      expect(loan.committeeDecision?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(loan.committeeDecision?.time).toBeDefined();
      expect(loan.committeeDecision?.comment).toContain('Verified compliant');
    });

    it('Stage 7: Loan is disbursed with bank transfer reference and transitions to ACTIVE', () => {
      loan = AdvancedLoanService.disburseLoan(loan, 'CBN-DISB-991823', '2026-09');

      expect(loan.status).toBe('ACTIVE');
      expect(loan.disbursementReference).toBe('CBN-DISB-991823');
      expect(loan.schedule.length).toBe(12);
      expect(loan.schedule[0].dueMonth).toBe('2026-09');
      expect(loan.schedule[0].expectedAmount).toBe(40000);
      expect(loan.schedule[0].status).toBe('PENDING');
    });

    it('Stage 8 & 9: Monthly payroll repayments decrement outstanding balance and update installments', () => {
      // Month 1 Repayment (₦40,000)
      const pay1 = AdvancedLoanService.processRepayment(loan, 40000, '2026-09', 'PAYROLL-2026-09');
      loan = pay1.updatedLoan;

      expect(loan.totalAmountRepaid).toBe(40000);
      expect(loan.outstandingBalance).toBe(440000);
      expect(loan.installmentsCompleted).toBe(1);
      expect(loan.installmentsRemaining).toBe(11);
      expect(loan.status).toBe('ACTIVE');
      expect(loan.schedule[0].status).toBe('PAID');

      // Month 2 to 11 Repayments (10 installments * ₦40,000 = ₦400,000)
      const payBulk = AdvancedLoanService.processRepayment(loan, 400000, '2027-08', 'PAYROLL-BULK');
      loan = payBulk.updatedLoan;

      expect(loan.totalAmountRepaid).toBe(440000);
      expect(loan.outstandingBalance).toBe(40000);
      expect(loan.installmentsCompleted).toBe(11);
      expect(loan.installmentsRemaining).toBe(1);
      expect(loan.status).toBe('ACTIVE');
    });

    it('Stage 10: Final repayment liquidates debt and automatically closes loan as FULLY_REPAID', () => {
      // Month 12 Final Repayment (₦40,000)
      const finalPay = AdvancedLoanService.processRepayment(loan, 40000, '2027-09', 'PAYROLL-FINAL');
      loan = finalPay.updatedLoan;

      expect(loan.totalAmountRepaid).toBe(480000);
      expect(loan.outstandingBalance).toBe(0);
      expect(loan.installmentsCompleted).toBe(12);
      expect(loan.installmentsRemaining).toBe(0);
      expect(loan.status).toBe('FULLY_REPAID');
      expect(finalPay.isFullyLiquidated).toBe(true);
      expect(loan.schedule.every(s => s.status === 'PAID')).toBe(true);
    });
  });

  describe('3. Committee Rejection Workflow', () => {
    it('should transition loan to REJECTED when committee disapproves with reason', () => {
      const rejectedLoan = AdvancedLoanService.submitApplication({
        memberId: 'mem-02',
        employeeId: 'MIN-EMP-2081',
        applicantName: 'Mrs. Folashade Adeleke',
        department: 'Human Resources',
        gradeLevel: 'GL-12',
        accumulatedSavings: 500000,
        loanType: 'EMERGENCY_LOAN',
        requestedAmount: 300000,
        tenorMonths: 6,
        purpose: 'Personal non-distress expense',
      });

      const updated = AdvancedLoanService.recordCommitteeDecision(
        rejectedLoan,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        'REJECTED',
        'Purpose does not meet statutory criteria for emergency fast-track facility.'
      );

      expect(updated.status).toBe('REJECTED');
      expect(updated.committeeDecision?.decision).toBe('REJECTED');
      expect(updated.committeeDecision?.comment).toContain('statutory criteria');
    });
  });
});
