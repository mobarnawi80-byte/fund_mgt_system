import { describe, it, expect } from 'vitest';
import { UserRole, Permission, UserContext } from '../src/core/rbac/types';
import { RBACAuthorizer, AuthorizationError } from '../src/core/rbac/authorizer';

describe('Role-Based Access Control (RBAC) System', () => {
  // Test User Contexts
  const superAdminUser: UserContext = {
    userId: 'usr-admin-01',
    email: 'admin@ministry.gov.ng',
    role: UserRole.SUPER_ADMIN,
    fullName: 'System Super Administrator',
  };

  const financeOfficerUser: UserContext = {
    userId: 'usr-finance-01',
    memberId: 'mem-finance-01',
    email: 'finance@ministry.gov.ng',
    role: UserRole.FINANCE_OFFICER,
    fullName: 'Ibrahim Bala',
    staffId: 'MIN-FO-01',
  };

  const approvingOfficerUser: UserContext = {
    userId: 'usr-comm-01',
    email: 'approver@ministry.gov.ng',
    role: UserRole.APPROVING_OFFICER,
    fullName: 'Dr. Sarah Aliyu',
    staffId: 'MIN-COMM-04',
  };

  const memberA: UserContext = {
    userId: 'usr-mem-01',
    memberId: 'mem-001',
    email: 'member.a@ministry.gov.ng',
    role: UserRole.MEMBER,
    fullName: 'Chidi Okafor',
    staffId: 'MIN-EMP-1042',
  };

  const memberB: UserContext = {
    userId: 'usr-mem-02',
    memberId: 'mem-002',
    email: 'member.b@ministry.gov.ng',
    role: UserRole.MEMBER,
    fullName: 'Amina Yusuf',
    staffId: 'MIN-EMP-2089',
  };

  describe('1. Super Administrator Role', () => {
    it('should have access to all user and system configuration permissions', () => {
      expect(RBACAuthorizer.hasPermission(UserRole.SUPER_ADMIN, Permission.USERS_CREATE)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.SUPER_ADMIN, Permission.USERS_READ)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.SUPER_ADMIN, Permission.DEPARTMENTS_MANAGE)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.SUPER_ADMIN, Permission.CONTRIBUTION_RULES_MANAGE)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.SUPER_ADMIN, Permission.LOAN_SETTINGS_CONFIG)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.SUPER_ADMIN, Permission.AUDIT_VIEW)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.SUPER_ADMIN, Permission.SECURITY_BACKUPS_MANAGE)).toBe(true);
    });
  });

  describe('2. Finance Officer Role', () => {
    it('should have access to payroll, member registration, and reporting permissions', () => {
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.MEMBERS_REGISTER)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.PAYROLL_IMPORT)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.PAYROLL_RECONCILE)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.PAYMENTS_RECORD_MANUAL)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.WITHDRAWAL_PREPARE)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.FINANCIAL_REPORTS_GENERATE)).toBe(true);
    });

    it('must NOT be able to manage permissions or system security settings', () => {
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.PERMISSIONS_MANAGE)).toBe(false);
      expect(RBACAuthorizer.hasPermission(UserRole.FINANCE_OFFICER, Permission.SECURITY_BACKUPS_MANAGE)).toBe(false);
    });

    it('must NOT be able to delete financial records permanently', () => {
      expect(RBACAuthorizer.canPermanentlyDeleteFinancialRecords(UserRole.FINANCE_OFFICER)).toBe(false);
    });

    it('must NOT be allowed to approve their own transactions (Maker-Checker violation)', () => {
      // Finance officer applying for a loan cannot approve their own loan
      expect(
        RBACAuthorizer.canApproveTransaction(financeOfficerUser, financeOfficerUser.userId, Permission.LOANS_APPROVE)
      ).toBe(false);

      expect(() => {
        RBACAuthorizer.enforceMakerCheckerApproval(
          financeOfficerUser,
          financeOfficerUser.userId,
          Permission.LOANS_APPROVE
        );
      }).toThrowError(/cannot approve their own financial transaction/i);
    });
  });

  describe('3. Approving Officer / Committee Role', () => {
    it('should have permissions to review and approve loans and withdrawals', () => {
      expect(RBACAuthorizer.hasPermission(UserRole.APPROVING_OFFICER, Permission.LOANS_REVIEW)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.APPROVING_OFFICER, Permission.LOANS_APPROVE)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.APPROVING_OFFICER, Permission.WITHDRAWALS_APPROVE)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.APPROVING_OFFICER, Permission.MEMBER_CONTRIBUTION_HISTORY_VIEW_ANY)).toBe(true);
    });

    it('should generate complete approval audit record with Approver, Date, Time, Decision and Comment', () => {
      const approvalRecord = RBACAuthorizer.createApprovalRecord(
        approvingOfficerUser,
        'LOAN_APPLICATION',
        'loan-app-998',
        'APPROVED',
        'Applicant savings ₦1,200,000 exceeds requested loan of ₦500,000. Verified compliant.',
        '10.0.0.12'
      );

      expect(approvalRecord.approver.userId).toBe(approvingOfficerUser.userId);
      expect(approvalRecord.approver.name).toBe(approvingOfficerUser.fullName);
      expect(approvalRecord.approver.role).toBe(UserRole.APPROVING_OFFICER);
      expect(approvalRecord.decision).toBe('APPROVED');
      expect(approvalRecord.comment).toContain('Verified compliant');
      expect(approvalRecord.timestamp.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(approvalRecord.timestamp.time).toBeDefined();
      expect(approvalRecord.timestamp.isoUtc).toBeDefined();
    });

    it('should throw error if an approval decision is submitted without a mandatory comment', () => {
      expect(() => {
        RBACAuthorizer.createApprovalRecord(
          approvingOfficerUser,
          'LOAN_APPLICATION',
          'loan-app-998',
          'APPROVED',
          '   ' // empty comment
        );
      }).toThrowError(/mandatory justification comment is required/i);
    });
  });

  describe('4. Member Role & Strict Isolation Boundary', () => {
    it('should have member self-service permissions', () => {
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.PROFILE_VIEW_SELF)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.CONTRIBUTION_BALANCE_VIEW_SELF)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.LOAN_APPLY)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.WITHDRAWAL_REQUEST)).toBe(true);
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.MANUAL_PAYMENT_SUBMIT)).toBe(true);
    });

    it('must NOT have administrative, payroll, or approval permissions', () => {
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.PAYROLL_IMPORT)).toBe(false);
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.LOANS_APPROVE)).toBe(false);
      expect(RBACAuthorizer.hasPermission(UserRole.MEMBER, Permission.MEMBERS_READ_ALL)).toBe(false);
    });

    it('should permit a member to access only their own data and deny access to other members', () => {
      // Member A accessing Member A data -> Allowed
      expect(RBACAuthorizer.canAccessMemberData(memberA, 'mem-001')).toBe(true);

      // Member A accessing Member B data -> Forbidden
      expect(RBACAuthorizer.canAccessMemberData(memberA, 'mem-002')).toBe(false);

      expect(() => {
        RBACAuthorizer.enforceMemberIsolation(memberA, 'mem-002');
      }).toThrowError(/cannot access member account/i);
    });

    it('should permit elevated roles to access member data for verification and auditing', () => {
      expect(RBACAuthorizer.canAccessMemberData(superAdminUser, 'mem-001')).toBe(true);
      expect(RBACAuthorizer.canAccessMemberData(financeOfficerUser, 'mem-001')).toBe(true);
      expect(RBACAuthorizer.canAccessMemberData(approvingOfficerUser, 'mem-001')).toBe(true);
    });
  });
});
