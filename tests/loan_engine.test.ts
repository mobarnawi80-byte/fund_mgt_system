import { describe, it, expect } from 'vitest';
import { LoanEngine, LoanEntity } from '../src/core/loans/loan-engine';

describe('0% Interest Loan Management & Amortization Engine', () => {
  const memberSavings = 1200000; // ₦1.2M accumulated savings

  describe('1. Loan Application Rule Validation', () => {
    it('should approve loan application within accumulated savings limit', () => {
      const result = LoanEngine.validateApplication(memberSavings, 600000, 12, 0);

      expect(result.isEligible).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.interestRate).toBe(0.0);
      expect(result.monthlyInstallment).toBe(50000); // 600k / 12
      expect(result.savingsSecurityBuffer).toBe(600000); // 1.2M - 600k
    });

    it('should reject loan application exceeding accumulated savings', () => {
      const result = LoanEngine.validateApplication(memberSavings, 1500000, 12, 0);

      expect(result.isEligible).toBe(false);
      expect(result.violations[0]).toContain('exceeds member accumulated contributions');
    });

    it('should reject loan application if member already has 2 active loans', () => {
      const result = LoanEngine.validateApplication(memberSavings, 300000, 6, 2);

      expect(result.isEligible).toBe(false);
      expect(result.violations[0]).toContain('maximum allowable concurrent active loans');
    });
  });

  describe('2. 0% Interest Amortization Schedule Generation', () => {
    it('should generate an exact monthly amortization schedule', () => {
      const principal = 360000;
      const tenorMonths = 6;
      const schedule = LoanEngine.generateSchedule(principal, tenorMonths, '2026-09');

      expect(schedule.length).toBe(6);
      expect(schedule[0].dueMonth).toBe('2026-09');
      expect(schedule[0].expectedAmount).toBe(60000);
      expect(schedule[0].interestPortion).toBe(0);
      expect(schedule[5].dueMonth).toBe('2027-02');

      const sumOfInstallments = schedule.reduce((sum, item) => sum + item.expectedAmount, 0);
      expect(sumOfInstallments).toBe(principal);
    });
  });

  describe('3. Loan Repayment Processing & Debt Liquidation', () => {
    it('should apply monthly repayment, decrement balance, and transition status to PAID_OFF', () => {
      const principal = 120000;
      const tenorMonths = 3;
      const schedule = LoanEngine.generateSchedule(principal, tenorMonths, '2026-09');

      let loan: LoanEntity = {
        id: 'ln-test-01',
        loanNumber: 'LOAN-2026-0099',
        memberId: 'mem-001',
        loanType: 'SALARY_ADVANCE',
        principalAmount: principal,
        interestRate: 0.0,
        monthlyInstallment: 40000,
        tenorMonths,
        totalRepayable: principal,
        totalPaid: 0,
        outstandingBalance: principal,
        status: 'ACTIVE',
        schedule,
      };

      // Month 1 Repayment (₦40,000)
      const pay1 = LoanEngine.applyRepayment(loan, 40000, '2026-09', 'PAYROLL-2026-09');
      loan = pay1.updatedLoan;
      expect(loan.totalPaid).toBe(40000);
      expect(loan.outstandingBalance).toBe(80000);
      expect(loan.status).toBe('ACTIVE');
      expect(loan.schedule[0].status).toBe('PAID');

      // Month 2 Repayment (₦40,000)
      const pay2 = LoanEngine.applyRepayment(loan, 40000, '2026-10', 'PAYROLL-2026-10');
      loan = pay2.updatedLoan;
      expect(loan.totalPaid).toBe(80000);
      expect(loan.outstandingBalance).toBe(40000);
      expect(loan.status).toBe('ACTIVE');
      expect(loan.schedule[1].status).toBe('PAID');

      // Month 3 Final Repayment (₦40,000) -> Full Payoff
      const pay3 = LoanEngine.applyRepayment(loan, 40000, '2026-11', 'PAYROLL-2026-11');
      loan = pay3.updatedLoan;
      expect(loan.totalPaid).toBe(120000);
      expect(loan.outstandingBalance).toBe(0);
      expect(loan.status).toBe('PAID_OFF');
      expect(loan.schedule[2].status).toBe('PAID');
    });
  });
});
