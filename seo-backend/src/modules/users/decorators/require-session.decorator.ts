import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { REQUIRE_SESSION_KEY, SessionGuard } from '../guards/session.guard';

/**
 * Decorator to protect endpoints with Auth0 session-based authentication
 *
 * @example
 * ```typescript
 * @RequireSession()
 * async myEndpoint(@CurrentUser() user: AuthenticatedUser) {
 *   // Only authenticated users can access this
 * }
 * ```
 */
export function RequireSession() {
  return applyDecorators(
    SetMetadata(REQUIRE_SESSION_KEY, true),
    UseGuards(SessionGuard),
  );
}

