import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { LicenseGuard, REQUIRE_LICENSE_KEY } from '../guards/license.guard';

/**
 * Decorator to protect endpoints with license-based authentication
 *
 * @example
 * ```typescript
 * @RequireLicense()
 * async myEndpoint(@CurrentUser() user) {
 *   // Only users with valid licenses can access this
 * }
 * ```
 */
export function RequireLicense() {
  return applyDecorators(
    SetMetadata(REQUIRE_LICENSE_KEY, true),
    UseGuards(LicenseGuard),
  );
}
