import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';
import { RoleGuard, ROLES_KEY } from '../guards/role.guard';

/**
 * Decorator to protect endpoints with role-based authorization
 * Must be used in combination with @RequireAuth() decorator
 *
 * @example
 * ```typescript
 * @RequireAuth()
 * @RequireRole(UserRole.ADMIN)
 * @Get('admin-only')
 * async adminOnly(@CurrentUser() user: AuthenticatedUser) {
 *   // Only admins can access this
 * }
 * ```
 */
export function RequireRole(...roles: UserRole[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(RoleGuard),
  );
}

