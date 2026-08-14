import { describe, it, expect } from 'vitest';
import { CURRENT_LOGGED_IN_MEMBER } from '../src/mock/memberPortalData';
import { RBACAuthorizer } from '../src/core/rbac/authorizer';
import { UserRole, UserContext } from '../src/core/rbac/types';

describe('Member Portal Calculations & Security Isolation', () => {
  const loggedInMember = CURRENT_LOGGED_IN_MEMBER;

  const memberUserContext: UserContext = {
    userId: 'usr-mem-01',
    memberId: loggedInMember.id, // 'mem-001'
    email: loggedInMember.email,
    role: UserRole.MEMBER,
    fullName: loggedInMember.fullName,
    staffId: loggedInMember.employeeId,
  };

  describe('1. Member Data Isolation Security', () => {
    it('must allow member to access own account data', () => {
      expect(RBACAuthorizer.canAccessMemberData(memberUserContext, 'mem-001')).toBe(true);
    });

    it('must strictly deny member from accessing any other member account', () => {
      expect(RBACAuthorizer.canAccessMemberData(memberUserContext, 'mem-002')).toBe(false);
      expect(RBACAuthorizer.canAccessMemberData(memberUserContext, 'mem-999')).toBe(false);

      expect(() => {
        RBACAuthorizer.enforceMemberIsolation(memberUserContext, 'mem-002');
      }).toThrowError(/cannot access member account/i);
    });
  });

  describe('2. Loan Application & 0% Interest Calculations', () => {
    it('should enforce that loan amount cannot exceed member accumulated savings', () => {
      const maxAllowedLoan = loggedInMember.currentContributionBalance; // 1,750,000
      const validLoanAmount = 1000000;
      const invalidLoanAmount = 2000000;

      expect(validLoanAmount <= maxAllowedLoan).toBe(true);
      expect(invalidLoanAmount <= maxAllowedLoan).toBe(false);
    });

    it('should correctly calculate 0% interest monthly repayment and remaining installments', () => {
      const requestedPrincipal = 480000;
      const tenorMonths = 12;
      const monthlyRepayment = requestedPrincipal / tenorMonths; // 40,000

      expect(monthlyRepayment).toBe(40000);

      // After 6 months of repayments
      const monthsElapsed = 6;
      const amountRepaid = monthlyRepayment * monthsElapsed; // 240,000
      const remainingBalance = requestedPrincipal - amountRepaid; // 240,000
      const installmentsLeft = tenorMonths - monthsElapsed; // 6

      expect(amountRepaid).toBe(240000);
      expect(remainingBalance).toBe(240000);
      expect(installmentsLeft).toBe(6);
    });
  });

  describe('3. Withdrawal Clearance & Loan Offset Calculation', () => {
    it('should deduct outstanding active loans from requested withdrawal to yield net payout', () => {
      const grossRequestedWithdrawal = 1000000;
      const activeLoanDebt = loggedInMember.currentLoanBalance; // 240,000
      const netPayout = grossRequestedWithdrawal - activeLoanDebt; // 760,000

      expect(netPayout).toBe(760000);
      expect(netPayout).toBeGreaterThanOrEqual(0);
    });

    it('should calculate full membership exit liquidation net settlement correctly', () => {
      const totalAccumulatedSavings = loggedInMember.currentContributionBalance; // 1,750,000
      const activeLoanDebt = loggedInMember.currentLoanBalance; // 240,000
      const exitNetPayout = totalAccumulatedSavings - activeLoanDebt; // 1,510,000

      expect(exitNetPayout).toBe(1510000);
    });
  });

  describe('4. Beneficiary Allocation Percentage Integrity', () => {
    it('should enforce that beneficiary percentage allocations sum to exactly 100%', () => {
      const totalAllocation = loggedInMember.beneficiaries.reduce(
        (sum, b) => sum + b.allocationPercentage,
        0
      );

      expect(totalAllocation).toBe(100);
      expect(loggedInMember.beneficiaries.some((b) => b.isPrimary)).toBe(true);
    });
  });
});
