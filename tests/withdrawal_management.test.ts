import { describe, it, expect } from 'vitest';
import { 
  WithdrawalService, 
  WithdrawalRequestEntity 
} from '../src/core/withdrawals/withdrawal-service';

describe('Member Withdrawal Management & Savings Liquidation System', () => {
  const accumulatedSavings = 1500000; // ₦1.5M
  const activeLoanBalance = 300000;   // ₦300k active loan

  describe('1. Eligibility & Net Available Balance Calculations', () => {
    it('should calculate max allowable withdrawal taking active loan offset into account', () => {
      // 1.5M savings - 300k loan = 1.2M max allowable
      const eligibility = WithdrawalService.checkEligibility(accumulatedSavings, activeLoanBalance, 800000);

      expect(eligibility.isEligible).toBe(true);
      expect(eligibility.maxAllowableWithdrawal).toBe(1200000);
      expect(eligibility.requestedAmount).toBe(800000);
      expect(eligibility.violations.length).toBe(0);
    });

    it('should strictly reject withdrawal request exceeding net available savings balance', () => {
      // Requesting 1.3M when only 1.2M is net available
      const invalidEligibility = WithdrawalService.checkEligibility(accumulatedSavings, activeLoanBalance, 1300000);

      expect(invalidEligibility.isEligible).toBe(false);
      expect(invalidEligibility.violations[0]).toContain('exceeds maximum allowable net savings balance of ₦1,200,000');
    });
  });

  describe('2. Full 7-Stage Withdrawal Workflow & Financial Ledger Integrity', () => {
    let request: WithdrawalRequestEntity;

    it('Stage 1 & 2 & 3: Member submits request, system validates and records PENDING_COMMITTEE_REVIEW without modifying balance', () => {
      request = WithdrawalService.submitRequest({
        memberId: 'mem-06',
        employeeId: 'MIN-EMP-6004',
        memberName: 'Babatunde Raji',
        department: 'Legal Services',
        gradeLevel: 'GL-15',
        bankName: 'Zenith Bank PLC',
        accountNumber: '1019283741',
        accountName: 'Babatunde Raji',
        accumulatedSavings,
        activeLoanBalance,
        requestedAmount: 500000,
        reason: 'Voluntary partial withdrawal for children university tuition',
      });

      expect(request.status).toBe('PENDING_COMMITTEE_REVIEW');
      expect(request.requestedAmount).toBe(500000);
      expect(request.accumulatedSavingsAtRequest).toBe(1500000);
      // Ensure member balance is preserved at this stage
      expect(request.payoutAudit).toBeUndefined();
    });

    it('Stage 4 & 5: Committee reviews, approves, and records immutable digital audit trail', () => {
      request = WithdrawalService.recordCommitteeDecision(
        request,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        'APPROVED',
        500000,
        'Member net savings balance is sufficient after loan clearance. Approved in full.'
      );

      expect(request.status).toBe('APPROVED');
      expect(request.approvedAmount).toBe(500000);
      expect(request.committeeAudit).toBeDefined();
      expect(request.committeeAudit?.approverName).toBe('Dr. Sarah Aliyu');
      expect(request.committeeAudit?.decision).toBe('APPROVED');
      expect(request.committeeAudit?.approvalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(request.committeeAudit?.comment).toContain('Approved in full');
    });

    it('Stage 6 & 7: Finance processes payment, posts double-entry journal, and updates member savings balance', () => {
      const payoutResult = WithdrawalService.processPaymentAndPostLedger(
        request,
        { id: 'usr-finance-01', name: 'Mallam Ibrahim Finance Officer' },
        'NIBSS-PAYOUT-991823746192',
        '2026-08-14'
      );

      request = payoutResult.updatedRequest;

      expect(request.status).toBe('PAID_OUT_AND_SETTLED');
      expect(request.payoutAudit).toBeDefined();
      expect(request.payoutAudit?.paymentReference).toBe('NIBSS-PAYOUT-991823746192');
      expect(request.payoutAudit?.processedByName).toBe('Mallam Ibrahim Finance Officer');

      // Double-entry general ledger journal check
      expect(payoutResult.generalLedgerJournal.debitAccount).toContain('2010 - Member Savings Pool');
      expect(payoutResult.generalLedgerJournal.creditAccount).toContain('1010 - Cooperative Bank');
      expect(payoutResult.generalLedgerJournal.amount).toBe(500000);

      // Financial balance updated ONLY after payment processing
      expect(payoutResult.newMemberSavingsBalance).toBe(1000000); // 1.5M - 500k = 1.0M
    });
  });

  describe('3. Committee Rejection Handling', () => {
    it('should record rejection decision and keep member savings untouched', () => {
      const pendingReq = WithdrawalService.submitRequest({
        memberId: 'mem-07',
        employeeId: 'MIN-EMP-7199',
        memberName: 'Hauwa Sanusi',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-09',
        bankName: 'First Bank of Nigeria',
        accountNumber: '3091827364',
        accountName: 'Hauwa Sanusi',
        accumulatedSavings: 800000,
        activeLoanBalance: 0,
        requestedAmount: 300000,
        reason: 'Unverified withdrawal ground',
      });

      const rejectedReq = WithdrawalService.recordCommitteeDecision(
        pendingReq,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        'REJECTED',
        0,
        'Application does not comply with minimum 6-month statutory holding period.'
      );

      expect(rejectedReq.status).toBe('REJECTED');
      expect(rejectedReq.committeeAudit?.decision).toBe('REJECTED');
      expect(rejectedReq.approvedAmount).toBe(0);
      expect(rejectedReq.payoutAudit).toBeUndefined();
    });
  });
});
