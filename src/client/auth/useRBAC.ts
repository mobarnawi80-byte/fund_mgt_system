import { useMemo } from 'react';
import { UserRole, Permission, UserContext } from '../../core/rbac/types';
import { RBACAuthorizer } from '../../core/rbac/authorizer';

export interface UseRBACReturn {
  user: UserContext | null;
  role: UserRole | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  canAccessMember: (targetMemberId: string) => boolean;
  isSuperAdmin: boolean;
  isFinanceOfficer: boolean;
  isApprovingOfficer: boolean;
  isMember: boolean;
}

/**
 * Frontend React Hook for Role-Based Access Control
 */
export function useRBAC(currentUser: UserContext | null): UseRBACReturn {
  return useMemo(() => {
    if (!currentUser) {
      return {
        user: null,
        role: null,
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        hasRole: () => false,
        canAccessMember: () => false,
        isSuperAdmin: false,
        isFinanceOfficer: false,
        isApprovingOfficer: false,
        isMember: false,
      };
    }

    const role = currentUser.role;

    const hasPermission = (permission: Permission): boolean => {
      return RBACAuthorizer.hasPermission(role, permission);
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
      return permissions.some((p) => RBACAuthorizer.hasPermission(role, p));
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
      return permissions.every((p) => RBACAuthorizer.hasPermission(role, p));
    };

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      return allowedRoles.includes(role);
    };

    const canAccessMember = (targetMemberId: string): boolean => {
      return RBACAuthorizer.canAccessMemberData(currentUser, targetMemberId);
    };

    return {
      user: currentUser,
      role,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      canAccessMember,
      isSuperAdmin: role === UserRole.SUPER_ADMIN,
      isFinanceOfficer: role === UserRole.FINANCE_OFFICER,
      isApprovingOfficer: role === UserRole.APPROVING_OFFICER,
      isMember: role === UserRole.MEMBER,
    };
  }, [currentUser]);
}
