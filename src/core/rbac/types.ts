/**
 * Role-Based Access Control (RBAC) Type Definitions
 * Ministry Cooperative Contributory Fund Management System
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  APPROVING_OFFICER = 'APPROVING_OFFICER',
  MEMBER = 'MEMBER',
}

export enum Permission {
  // Super Administrator Permissions
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  DEPARTMENTS_MANAGE = 'departments:manage',
  CONTRIBUTION_RULES_MANAGE = 'contribution_rules:manage',
  CONTRIBUTION_SETTINGS_CONFIG = 'contribution_settings:config',
  LOAN_SETTINGS_CONFIG = 'loan_settings:config',
  TRANSACTIONS_VIEW_ALL = 'transactions:view_all',
  REPORTS_VIEW_ALL = 'reports:view_all',
  SYSTEM_SETTINGS_MANAGE = 'system_settings:manage',
  PERMISSIONS_MANAGE = 'permissions:manage',
  ADMIN_CHANGES_APPROVE = 'admin_changes:approve',
  AUDIT_VIEW = 'audit:view',
  SECURITY_BACKUPS_MANAGE = 'security_backups:manage',

  // Finance Officer Permissions
  MEMBERS_READ_ALL = 'members:read_all',
  MEMBERS_REGISTER = 'members:register',
  PAYROLL_IMPORT = 'payroll:import',
  CONTRIBUTIONS_VERIFY = 'contributions:verify',
  PAYMENTS_RECORD_MANUAL = 'payments:record_manual',
  CONTRIBUTION_TRANSACTIONS_VIEW = 'contribution_transactions:view',
  PAYROLL_RECONCILE = 'payroll:reconcile',
  LOAN_REPAYMENT_MANAGE = 'loan_repayment:manage',
  WITHDRAWAL_PREPARE = 'withdrawal:prepare',
  FINANCIAL_REPORTS_GENERATE = 'financial_reports:generate',

  // Approving Officer / Committee Permissions
  LOANS_REVIEW = 'loans:review',
  LOANS_APPROVE = 'loans:approve',
  LOANS_REJECT = 'loans:reject',
  WITHDRAWALS_REVIEW = 'withdrawals:review',
  WITHDRAWALS_APPROVE = 'withdrawals:approve',
  WITHDRAWALS_REJECT = 'withdrawals:reject',
  SUPPORTING_INFO_VIEW = 'supporting_info:view',
  MEMBER_CONTRIBUTION_HISTORY_VIEW_ANY = 'member_contribution_history:view_any',
  MEMBER_LOAN_HISTORY_VIEW_ANY = 'member_loan_history:view_any',

  // Member Permissions (Strictly Self-Service)
  PROFILE_VIEW_SELF = 'profile:view_self',
  CONTRIBUTIONS_TOTAL_VIEW_SELF = 'contributions_total:view_self',
  CONTRIBUTION_HISTORY_VIEW_SELF = 'contribution_history:view_self',
  CONTRIBUTION_BALANCE_VIEW_SELF = 'contribution_balance:view_self',
  LOAN_BALANCE_VIEW_SELF = 'loan_balance:view_self',
  WITHDRAWAL_INFO_VIEW_SELF = 'withdrawal_info:view_self',
  BENEFICIARY_INFO_VIEW_SELF = 'beneficiary_info:view_self',
  LOAN_APPLY = 'loan:apply',
  WITHDRAWAL_REQUEST = 'withdrawal:request',
  APPLICATION_STATUS_VIEW_SELF = 'application_status:view_self',
  NOTIFICATIONS_RECEIVE_SELF = 'notifications:receive_self',
  MANUAL_PAYMENT_SUBMIT = 'manual_payment:submit',
}

export interface UserContext {
  userId: string;
  memberId?: string; // Present if user is a member
  email: string;
  role: UserRole;
  staffId?: string;
  fullName: string;
  department?: string;
}

export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export interface ApprovalRecord {
  approvalId: string;
  entityType: 'LOAN_APPLICATION' | 'WITHDRAWAL_REQUEST' | 'ADMINISTRATIVE_CHANGE';
  entityId: string;
  approver: {
    userId: string;
    name: string;
    role: UserRole;
    staffId?: string;
  };
  timestamp: {
    isoUtc: string;
    date: string;
    time: string;
  };
  decision: ApprovalDecision;
  comment: string;
  ipAddress?: string;
}
