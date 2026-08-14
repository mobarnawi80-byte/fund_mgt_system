import { UserRole, Permission } from './types';

/**
 * Authoritative mapping of Roles to their Permitted Scopes
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.USERS_CREATE,
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.DEPARTMENTS_MANAGE,
    Permission.CONTRIBUTION_RULES_MANAGE,
    Permission.CONTRIBUTION_SETTINGS_CONFIG,
    Permission.LOAN_SETTINGS_CONFIG,
    Permission.TRANSACTIONS_VIEW_ALL,
    Permission.REPORTS_VIEW_ALL,
    Permission.SYSTEM_SETTINGS_MANAGE,
    Permission.PERMISSIONS_MANAGE,
    Permission.ADMIN_CHANGES_APPROVE,
    Permission.AUDIT_VIEW,
    Permission.SECURITY_BACKUPS_MANAGE,
    // Administrative visibility
    Permission.MEMBERS_READ_ALL,
    Permission.MEMBERS_REGISTER,
    Permission.MEMBER_CONTRIBUTION_HISTORY_VIEW_ANY,
    Permission.MEMBER_LOAN_HISTORY_VIEW_ANY,
  ],

  [UserRole.FINANCE_OFFICER]: [
    Permission.MEMBERS_READ_ALL,
    Permission.MEMBERS_REGISTER,
    Permission.PAYROLL_IMPORT,
    Permission.CONTRIBUTIONS_VERIFY,
    Permission.PAYMENTS_RECORD_MANUAL,
    Permission.CONTRIBUTION_TRANSACTIONS_VIEW,
    Permission.PAYROLL_RECONCILE,
    Permission.LOAN_REPAYMENT_MANAGE,
    Permission.WITHDRAWAL_PREPARE,
    Permission.FINANCIAL_REPORTS_GENERATE,
    Permission.MEMBER_CONTRIBUTION_HISTORY_VIEW_ANY,
    Permission.MEMBER_LOAN_HISTORY_VIEW_ANY,
  ],

  [UserRole.APPROVING_OFFICER]: [
    Permission.LOANS_REVIEW,
    Permission.LOANS_APPROVE,
    Permission.LOANS_REJECT,
    Permission.WITHDRAWALS_REVIEW,
    Permission.WITHDRAWALS_APPROVE,
    Permission.WITHDRAWALS_REJECT,
    Permission.SUPPORTING_INFO_VIEW,
    Permission.MEMBER_CONTRIBUTION_HISTORY_VIEW_ANY,
    Permission.MEMBER_LOAN_HISTORY_VIEW_ANY,
    Permission.MEMBERS_READ_ALL,
  ],

  [UserRole.MEMBER]: [
    Permission.PROFILE_VIEW_SELF,
    Permission.CONTRIBUTIONS_TOTAL_VIEW_SELF,
    Permission.CONTRIBUTION_HISTORY_VIEW_SELF,
    Permission.CONTRIBUTION_BALANCE_VIEW_SELF,
    Permission.LOAN_BALANCE_VIEW_SELF,
    Permission.WITHDRAWAL_INFO_VIEW_SELF,
    Permission.BENEFICIARY_INFO_VIEW_SELF,
    Permission.LOAN_APPLY,
    Permission.WITHDRAWAL_REQUEST,
    Permission.APPLICATION_STATUS_VIEW_SELF,
    Permission.NOTIFICATIONS_RECEIVE_SELF,
    Permission.MANUAL_PAYMENT_SUBMIT,
  ],
};
