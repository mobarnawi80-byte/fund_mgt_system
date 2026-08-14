import { UserRole, Permission, UserContext, ApprovalRecord, ApprovalDecision } from './types';
import { ROLE_PERMISSIONS } from './role-permissions';

export class AuthorizationError extends Error {
  constructor(message: string, public readonly code: string = 'FORBIDDEN') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class RBACAuthorizer {
  /**
   * Check if a role possesses a given permission
   */
  public static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Enforce role permission check or throw AuthorizationError
   */
  public static enforcePermission(user: UserContext, permission: Permission): void {
    if (!this.hasPermission(user.role, permission)) {
      throw new AuthorizationError(
        `Access Denied: Role '${user.role}' lacks permission '${permission}'`,
        'PERMISSION_DENIED'
      );
    }
  }

  /**
   * Strict Member Data Isolation Guard
   * Ensures Members can only view/mutate their own individual account data.
   * Administrative/Finance/Approving roles have elevated access based on their permissions.
   */
  public static canAccessMemberData(user: UserContext, targetMemberId: string): boolean {
    // If the user is a Member, they are strictly limited to their own member record
    if (user.role === UserRole.MEMBER) {
      return !!user.memberId && user.memberId === targetMemberId;
    }

    // Elevated roles require read permissions
    return (
      this.hasPermission(user.role, Permission.MEMBERS_READ_ALL) ||
      this.hasPermission(user.role, Permission.MEMBER_CONTRIBUTION_HISTORY_VIEW_ANY)
    );
  }

  /**
   * Enforce member data isolation
   */
  public static enforceMemberIsolation(user: UserContext, targetMemberId: string): void {
    if (!this.canAccessMemberData(user, targetMemberId)) {
      throw new AuthorizationError(
        `Access Denied: Member '${user.userId}' cannot access member account '${targetMemberId}'`,
        'MEMBER_ISOLATION_VIOLATION'
      );
    }
  }

  /**
   * Maker-Checker & Self-Approval Constraint Guard
   * Prevents Finance Officers or any user from approving their own financial transactions.
   */
  public static canApproveTransaction(
    approver: UserContext,
    initiatorUserId: string,
    requiredPermission: Permission = Permission.LOANS_APPROVE
  ): boolean {
    // Approver must have explicit approval permission
    if (!this.hasPermission(approver.role, requiredPermission)) {
      return false;
    }

    // Maker-Checker Rule: Cannot approve your own transaction
    if (approver.userId === initiatorUserId) {
      return false;
    }

    return true;
  }

  /**
   * Enforce maker-checker approval validation
   */
  public static enforceMakerCheckerApproval(
    approver: UserContext,
    initiatorUserId: string,
    requiredPermission: Permission = Permission.LOANS_APPROVE
  ): void {
    if (approver.userId === initiatorUserId) {
      throw new AuthorizationError(
        `Dual-Control Violation: User '${approver.userId}' cannot approve their own financial transaction.`,
        'SELF_APPROVAL_PROHIBITED'
      );
    }

    this.enforcePermission(approver, requiredPermission);
  }

  /**
   * Financial Immutability Guard
   * Direct permanent deletion of financial transactions is strictly forbidden.
   */
  public static canPermanentlyDeleteFinancialRecords(role: UserRole): boolean {
    // Permanent deletion is prohibited for all roles (including Super Admin and Finance Officer)
    return false;
  }

  /**
   * Approval Audit Generator
   * Creates an immutable audit trace of every committee decision with:
   * - Approver identity (userId, name, role, staffId)
   * - Date & Time (UTC & Local)
   * - Decision (APPROVED / REJECTED)
   * - Mandatory Comment
   */
  public static createApprovalRecord(
    approver: UserContext,
    entityType: 'LOAN_APPLICATION' | 'WITHDRAWAL_REQUEST' | 'ADMINISTRATIVE_CHANGE',
    entityId: string,
    decision: ApprovalDecision,
    comment: string,
    ipAddress?: string
  ): ApprovalRecord {
    if (!comment || comment.trim().length === 0) {
      throw new AuthorizationError(
        'Approval Decision Incomplete: A mandatory justification comment is required.',
        'APPROVAL_COMMENT_MANDATORY'
      );
    }

    const now = new Date();
    const isoUtc = now.toISOString();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    return {
      approvalId: `appr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      approver: {
        userId: approver.userId,
        name: approver.fullName,
        role: approver.role,
        staffId: approver.staffId,
      },
      timestamp: {
        isoUtc,
        date: dateStr,
        time: timeStr,
      },
      decision,
      comment: comment.trim(),
      ipAddress,
    };
  }
}
