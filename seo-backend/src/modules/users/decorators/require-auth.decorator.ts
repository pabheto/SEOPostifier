import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtGuard, REQUIRE_AUTH_KEY } from '../guards/jwt.guard';

/**
 * Decorator to protect endpoints with JWT-based authentication
 *
 * @example
 * ```typescript
 * @RequireAuth()
 * @Get('profile')
 * async getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   // Only authenticated users can access this
 * }
 * ```
 */
export function RequireAuth() {
  return applyDecorators(
    SetMetadata(REQUIRE_AUTH_KEY, true),
    UseGuards(JwtGuard),
  );
}
