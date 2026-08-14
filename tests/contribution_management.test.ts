import { describe, it, expect } from 'vitest';
import { 
  ContributionService, 
  MemberMonthlyContributionRecord 
} from '../src/core/contributions/contribution-service';

describe('Monthly Contribution Management Core Service', () => {
  describe('1. Salary / Grade-Level Contribution Rules', () => {
    it('should retrieve correct minimum and default contribution amounts for civil service grade levels', () => {
      const gl08 = ContributionService.GRADE_RULES['GL-08'];
      const gl14 = ContributionService.GRADE_RULES['GL-14'];

      expect(gl08.minMonthlyContribution).toBe(15000);
      expect(gl08.defaultMonthlyContribution).toBe(20000);

      expect(gl14.minMonthlyContribution).toBe(35000);
      expect(gl14.defaultMonthlyContribution).toBe(50000);
    });

    it('should validate member-selected amounts against grade minimum', () => {
      // GL-14 min is 35,000. Selecting 50,000 is VALID
      const validSelection = ContributionService.validateMemberSelectedAmount('GL-14', 50000);
      expect(validSelection.isValid).toBe(true);

      // GL-14 min is 35,000. Selecting 20,000 is INVALID
      const invalidSelection = ContributionService.validateMemberSelectedAmount('GL-14', 20000);
      expect(invalidSelection.isValid).toBe(false);
      expect(invalidSelection.error).toContain('below the minimum mandatory contribution of ₦35,000');
    });
  });

  describe('2. Member Payment Status Classification (5 Statuses)', () => {
    const expected = 50000;

    it('should classify as PAID when actual equals expected', () => {
      const status = ContributionService.classifyPaymentStatus(expected, 50000, 'VERIFIED');
      expect(status).toBe('PAID');
    });

    it('should classify as PARTIALLY_PAID when actual is between 0 and expected', () => {
      const status = ContributionService.classifyPaymentStatus(expected, 30000, 'VERIFIED');
      expect(status).toBe('PARTIALLY_PAID');
    });

    it('should classify as NOT_PAID when actual is 0', () => {
      const status = ContributionService.classifyPaymentStatus(expected, 0, 'UNVERIFIED');
      expect(status).toBe('NOT_PAID');
    });

    it('should classify as OVERPAID when actual exceeds expected', () => {
      const status = ContributionService.classifyPaymentStatus(expected, 65000, 'VERIFIED');
      expect(status).toBe('OVERPAID');
    });

    it('should classify as PENDING_VERIFICATION when receipt is awaiting finance officer review', () => {
      const status = ContributionService.classifyPaymentStatus(expected, 50000, 'PENDING_VERIFICATION');
      expect(status).toBe('PENDING_VERIFICATION');
    });
  });

  describe('3. Manual Payment Recording for Missed Payroll Deduction', () => {
    const initialRecord: MemberMonthlyContributionRecord = {
      id: 'rec-test-01',
      memberId: 'mem-003',
      employeeId: 'MIN-EMP-3015',
      fullName: 'Engr. Emeka Okonkwo',
      department: 'Planning & Research',
      gradeLevel: 'GL-13',
      month: '2026-08',
      expectedContribution: 45000,
      actualContribution: 0,
      difference: -45000,
      paymentStatus: 'NOT_PAID',
      verificationStatus: 'UNVERIFIED',
    };

    it('should require a valid transaction reference, payment date, and amount > 0', () => {
      expect(() => {
        ContributionService.recordManualPayment(initialRecord, {
          memberId: 'mem-003',
          month: '2026-08',
          amount: 45000,
          paymentDate: '2026-08-14',
          transactionReference: '', // Missing ref
          paymentMethod: 'DIRECT_BANK_TRANSFER',
          recordedByUserId: 'usr-finance-01',
        });
      }).toThrowError(/Transaction Reference.*is mandatory/i);

      expect(() => {
        ContributionService.recordManualPayment(initialRecord, {
          memberId: 'mem-003',
          month: '2026-08',
          amount: 0, // Invalid amount
          paymentDate: '2026-08-14',
          transactionReference: 'NIBSS-994819',
          paymentMethod: 'DIRECT_BANK_TRANSFER',
          recordedByUserId: 'usr-finance-01',
        });
      }).toThrowError(/greater than zero/i);
    });

    it('should update contribution amount and transition status from NOT_PAID to PAID', () => {
      const updated = ContributionService.recordManualPayment(initialRecord, {
        memberId: 'mem-003',
        month: '2026-08',
        amount: 45000,
        paymentDate: '2026-08-14',
        transactionReference: 'NIBSS-TRF-881928374',
        paymentMethod: 'DIRECT_BANK_TRANSFER',
        recordedByUserId: 'usr-finance-01',
      });

      expect(updated.actualContribution).toBe(45000);
      expect(updated.difference).toBe(0);
      expect(updated.paymentStatus).toBe('PAID');
      expect(updated.verificationStatus).toBe('VERIFIED');
      expect(updated.transactionReference).toBe('NIBSS-TRF-881928374');
    });
  });

  describe('4. Authorized Financial Adjustments', () => {
    const existingRecord: MemberMonthlyContributionRecord = {
      id: 'rec-test-02',
      memberId: 'mem-002',
      employeeId: 'MIN-EMP-2081',
      fullName: 'Mrs. Folashade Adeleke',
      department: 'Human Resources',
      gradeLevel: 'GL-12',
      month: '2026-08',
      expectedContribution: 30000,
      actualContribution: 20000,
      difference: -10000,
      paymentStatus: 'PARTIALLY_PAID',
      verificationStatus: 'VERIFIED',
    };

    it('should enforce mandatory detailed justification and authorizing user ID', () => {
      expect(() => {
        ContributionService.applyAuthorizedAdjustment(existingRecord, {
          memberId: 'mem-002',
          month: '2026-08',
          adjustmentAmount: 10000,
          reason: 'Short', // Too short
          authorizedByUserId: 'usr-finance-01',
        });
      }).toThrowError(/detailed justification reason.*is mandatory/i);
    });

    it('should apply authorized adjustment and generate an immutable adjustment journal record', () => {
      const { updatedRecord, adjustmentJournal } = ContributionService.applyAuthorizedAdjustment(existingRecord, {
        memberId: 'mem-002',
        month: '2026-08',
        adjustmentAmount: 10000,
        reason: 'Authorized correction per Executive Committee Review Meeting #2026-08',
        authorizedByUserId: 'usr-finance-01',
      });

      expect(updatedRecord.actualContribution).toBe(30000);
      expect(updatedRecord.difference).toBe(0);
      expect(updatedRecord.paymentStatus).toBe('PAID');
      expect(adjustmentJournal.journalId).toContain('ADJ-JE-');
      expect(adjustmentJournal.authorizedBy).toBe('usr-finance-01');
    });
  });
});
