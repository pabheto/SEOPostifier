import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';
import { JwtGuard, REQUIRE_AUTH_KEY } from '../guards/jwt.guard';
import { RoleGuard, ROLES_KEY } from '../guards/role.guard';

/**
 * Decorator to protect endpoints with role-based authorization
 * Automatically includes authentication, so no need to use @RequireAuth() separately
 *
 * @example
 * ```typescript
 * @RequireRole(UserRole.ADMIN)
 * @Get('admin-only')
 * async adminOnly(@CurrentUser() user: AuthenticatedUser) {
 *   // Only admins can access this
 * }
 * ```
 */
export function RequireRole(...roles: UserRole[]) {
  return applyDecorators(
    SetMetadata(REQUIRE_AUTH_KEY, true),
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtGuard, RoleGuard),
  );
}
