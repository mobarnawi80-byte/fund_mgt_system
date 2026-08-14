import React from 'react';
import { UserRole, Permission, UserContext } from '../../core/rbac/types';
import { RBACAuthorizer } from '../../core/rbac/authorizer';

export interface RoleGateProps {
  user: UserContext | null;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  requiredAllPermissions?: Permission[];
  requiredAnyPermissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RoleGate Component
 * Conditionally renders UI elements based on User Roles and Permissions
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  user,
  allowedRoles,
  requiredPermission,
  requiredAllPermissions,
  requiredAnyPermissions,
  fallback = null,
  children,
}) => {
  if (!user) {
    return <>{fallback}</>;
  }

  // Role check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  // Single permission check
  if (requiredPermission) {
    if (!RBACAuthorizer.hasPermission(user.role, requiredPermission)) {
      return <>{fallback}</>;
    }
  }

  // All permissions check
  if (requiredAllPermissions && requiredAllPermissions.length > 0) {
    const hasAll = requiredAllPermissions.every((p) => RBACAuthorizer.hasPermission(user.role, p));
    if (!hasAll) {
      return <>{fallback}</>;
    }
  }

  // Any permission check
  if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
    const hasAny = requiredAnyPermissions.some((p) => RBACAuthorizer.hasPermission(user.role, p));
    if (!hasAny) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
