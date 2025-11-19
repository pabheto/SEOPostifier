import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import {
  LICENSE_ROLES_KEY,
  LicenseGuard,
  REQUIRE_LICENSE_KEY,
} from '../guards/license.guard';
import { LicenseRole } from '../schemas/license.schema';

/**
 * Decorator to protect endpoints with license-based authentication
 *
 * @param roles - Optional array of license roles that are allowed to access this endpoint
 *
 * @example
 * ```typescript
 * @RequireLicense()
 * async myEndpoint(@CurrentUser() user) {
 *   // Only users with valid licenses can access this
 * }
 *
 * @RequireLicense([LicenseRole.PREMIUM, LicenseRole.ENTERPRISE])
 * async premiumEndpoint(@CurrentUser() user) {
 *   // Only users with PREMIUM or ENTERPRISE licenses can access this
 * }
 * ```
 */
export function RequireLicense(roles?: LicenseRole[]) {
  const decorators = [
    SetMetadata(REQUIRE_LICENSE_KEY, true),
    UseGuards(LicenseGuard),
  ];

  if (roles && roles.length > 0) {
    decorators.push(SetMetadata(LICENSE_ROLES_KEY, roles));
  }

  return applyDecorators(...decorators);
}
