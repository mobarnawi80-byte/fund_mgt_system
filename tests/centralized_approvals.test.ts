import { describe, it, expect } from 'vitest';
import { 
  ApprovalEngine, 
  FinancialApprovalRequest 
} from '../src/core/approvals/approval-engine';

describe('Centralized Financial Approval Engine & Multi-Sig Governance', () => {
  describe('1. Configurable Approval Threshold Tiers', () => {
    it('should assign Tier 1 (1 signature) for amounts <= ₦200,000', () => {
      const tier = ApprovalEngine.getThresholdForAmount(150000);
      expect(tier.id).toBe('tier-1');
      expect(tier.requiredSignatures).toBe(1);
    });

    it('should assign Tier 2 (2 signatures) for amounts ₦200,001 - ₦1,000,000', () => {
      const tier = ApprovalEngine.getThresholdForAmount(500000);
      expect(tier.id).toBe('tier-2');
      expect(tier.requiredSignatures).toBe(2);
    });

    it('should assign Tier 3 (3 signatures + Chairman) for amounts > ₦1,000,000', () => {
      const tier = ApprovalEngine.getThresholdForAmount(2500000);
      expect(tier.id).toBe('tier-3');
      expect(tier.requiredSignatures).toBe(3);
      expect(tier.requiresChairmanApproval).toBe(true);
    });
  });

  describe('2. Request Creation & Submission Notification', () => {
    it('should create request with correct tier and dispatch submission notification', () => {
      const { request, notification } = ApprovalEngine.createRequest({
        requestType: 'LOAN_APPLICATION',
        initiatorUserId: 'usr-mem-02',
        initiatorName: 'Mustapha Danjuma',
        memberId: 'mem-02',
        employeeId: 'MIN-EMP-1088',
        applicantName: 'Mustapha Danjuma',
        department: 'Planning & Research',
        gradeLevel: 'GL-12',
        requestedAmount: 400000,
        memberContributionBalance: 920000,
        previousLoansCount: 1,
        currentLoanBalance: 0,
        supportingInformation: 'Salary advance for school fees',
      });

      expect(request.status).toBe('PENDING_APPROVAL');
      expect(request.signaturesRequired).toBe(2); // Tier 2
      expect(notification.eventType).toBe('REQUEST_SUBMITTED');
      expect(notification.title).toContain('New Financial Request');
    });
  });

  describe('3. Separation of Duties (Maker-Checker) Strict Guard', () => {
    it('should strictly throw error if initiating officer attempts to approve their own request', () => {
      const { request } = ApprovalEngine.createRequest({
        requestType: 'FINANCIAL_ADJUSTMENT',
        initiatorUserId: 'usr-finance-01',
        initiatorName: 'Mallam Ibrahim Finance Officer',
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        applicantName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-14',
        requestedAmount: 50000,
        memberContributionBalance: 1750000,
        previousLoansCount: 0,
        currentLoanBalance: 0,
        supportingInformation: 'Correction',
      });

      expect(() => {
        ApprovalEngine.recordDecision(
          request,
          { id: 'usr-finance-01', name: 'Mallam Ibrahim', role: 'Finance Officer' },
          'APPROVED',
          'Self approving adjustment'
        );
      }).toThrowError(/Segregation of Duties Violation.*cannot approve a financial request they initiated/i);
    });
  });

  describe('4. Multi-Signature Approval Progression', () => {
    it('should transition through UNDER_REVIEW to fully APPROVED upon receiving all required signatures', () => {
      const { request } = ApprovalEngine.createRequest({
        requestType: 'MEMBER_WITHDRAWAL',
        initiatorUserId: 'usr-mem-07',
        initiatorName: 'Hauwa Sanusi',
        memberId: 'mem-07',
        employeeId: 'MIN-EMP-7199',
        applicantName: 'Hauwa Sanusi',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-09',
        requestedAmount: 350000,
        memberContributionBalance: 850000,
        previousLoansCount: 0,
        currentLoanBalance: 0,
        supportingInformation: 'Wedding expenses withdrawal',
      });

      // Signature 1 of 2
      const step1 = ApprovalEngine.recordDecision(
        request,
        { id: 'usr-comm-02', name: 'Engr. Bello Garba', role: 'Committee Member' },
        'APPROVED',
        'Signature 1 verified and recorded.'
      );

      expect(step1.updatedRequest.status).toBe('UNDER_REVIEW');
      expect(step1.updatedRequest.signaturesReceived).toBe(1);

      // Signature 2 of 2 (Fully Approved)
      const step2 = ApprovalEngine.recordDecision(
        step1.updatedRequest,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        'APPROVED',
        'Final chairman sign-off. Approved in full.'
      );

      expect(step2.updatedRequest.status).toBe('APPROVED');
      expect(step2.updatedRequest.signaturesReceived).toBe(2);
      expect(step2.notification.eventType).toBe('REQUEST_APPROVED');
      expect(step2.notification.message).toContain('fully APPROVED');
    });

    it('should prevent the same officer from signing twice', () => {
      const { request } = ApprovalEngine.createRequest({
        requestType: 'LOAN_APPLICATION',
        initiatorUserId: 'usr-mem-01',
        initiatorName: 'Dr. Aliyu Mohammed',
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        applicantName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        gradeLevel: 'GL-14',
        requestedAmount: 500000,
        memberContributionBalance: 1750000,
        previousLoansCount: 0,
        currentLoanBalance: 0,
        supportingInformation: 'Tenor loan',
      });

      const step1 = ApprovalEngine.recordDecision(
        request,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        'APPROVED',
        'Signature 1.'
      );

      expect(() => {
        ApprovalEngine.recordDecision(
          step1.updatedRequest,
          { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
          'APPROVED',
          'Attempting second signature by same person.'
        );
      }).toThrowError(/already recorded an approval signature/i);
    });
  });

  describe('5. Clarification Request Workflow', () => {
    it('should record clarification inquiry and notify applicant', () => {
      const { request } = ApprovalEngine.createRequest({
        requestType: 'LOAN_APPLICATION',
        initiatorUserId: 'usr-mem-03',
        initiatorName: 'Grace Nnaji',
        memberId: 'mem-03',
        employeeId: 'MIN-EMP-2410',
        applicantName: 'Grace Nnaji',
        department: 'Human Resources',
        gradeLevel: 'GL-11',
        requestedAmount: 250000,
        memberContributionBalance: 680000,
        previousLoansCount: 2,
        currentLoanBalance: 0,
        supportingInformation: 'Emergency medical loan',
      });

      const res = ApprovalEngine.recordDecision(
        request,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        'CLARIFICATION_REQUESTED',
        'Please upload hospital admission letter.',
        'Please upload hospital admission letter.'
      );

      expect(res.updatedRequest.status).toBe('CLARIFICATION_REQUESTED');
      expect(res.updatedRequest.clarificationThread?.length).toBe(1);
      expect(res.notification.eventType).toBe('CLARIFICATION_REQUESTED');
    });
  });
});
