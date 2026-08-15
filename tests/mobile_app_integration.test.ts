import { describe, it, expect } from 'vitest';
import { MobileApiClient } from '../src/mobile/api/mobile-api-client';

describe('Mobile Application (Android & iOS) Backend API Integration', () => {
  describe('1. Home Dashboard API (Server-Side Balances)', () => {
    it('should return server-derived financial figures for authenticated member', async () => {
      const dashboard = await MobileApiClient.fetchHomeDashboard();

      expect(dashboard.memberId).toBe('mem-01');
      expect(dashboard.fullName).toBe('Dr. Aliyu Mohammed');
      expect(dashboard.employeeId).toBe('MIN-EMP-1042');
      expect(dashboard.currentSavingsBalance).toBe(1750000);
      expect(dashboard.monthlyContributionCommitment).toBe(50000);
      expect(dashboard.activeLoanBalance).toBe(240000);
      expect(dashboard.beneficiary.percentage).toBe(100);
    });
  });

  describe('2. Contribution History API', () => {
    it('should retrieve historical verified contribution schedule', async () => {
      const history = await MobileApiClient.fetchContributionHistory();

      expect(history.length).toBeGreaterThanOrEqual(5);
      expect(history[0].month).toBe('2026-08');
      expect(history[0].actualAmount).toBe(50000);
      expect(history[0].paymentStatus).toBe('PAID');
    });
  });

  describe('3. Loan Summary & Backend 0% Interest Eligibility API', () => {
    it('should return active facility and backend eligibility ceiling', async () => {
      const loanSummary = await MobileApiClient.fetchLoanSummary();

      expect(loanSummary.hasActiveLoan).toBe(true);
      expect(loanSummary.activeLoan?.interestRate).toBe(0.0);
      expect(loanSummary.activeLoan?.outstandingBalance).toBe(240000);
      expect(loanSummary.activeLoan?.installmentsRemaining).toBe(6);
      expect(loanSummary.loanEligibility.maxEligibleAmount).toBe(1750000);
    });

    it('should successfully submit loan application to backend', async () => {
      const result = await MobileApiClient.submitLoanApplication({
        loanType: 'SALARY_ADVANCE',
        requestedAmount: 300000,
        tenorMonths: 10,
        purpose: 'School fees',
      });

      expect(result.success).toBe(true);
      expect(result.loanNumber).toContain('LOAN-2026-');
    });
  });

  describe('4. Withdrawal Net Clearance API', () => {
    it('should return net allowable withdrawal after active loan deduction', async () => {
      const wthSummary = await MobileApiClient.fetchWithdrawalSummary();

      expect(wthSummary.isEligibleForWithdrawal).toBe(true);
      expect(wthSummary.totalSavingsPool).toBe(1750000);
      expect(wthSummary.activeLoanDeduction).toBe(240000);
      // Net allowable = 1,750,000 - 240,000 = 1,510,000
      expect(wthSummary.maxNetAllowableWithdrawal).toBe(1510000);
    });

    it('should submit withdrawal request to backend for committee review', async () => {
      const result = await MobileApiClient.submitWithdrawalRequest({
        requestedAmount: 200000,
        reason: 'Medical expense',
        bankName: 'Zenith Bank PLC',
        accountNumber: '1019283741',
      });

      expect(result.success).toBe(true);
      expect(result.requestNumber).toContain('WTH-2026-');
    });
  });
});
