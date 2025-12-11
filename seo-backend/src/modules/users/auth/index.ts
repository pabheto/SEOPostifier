// Export all authentication-related decorators, guards, and types
export {
  CurrentLicense,
  CurrentUser,
} from '../decorators/current-user.decorator';
export type {
  AuthenticatedUser,
  RequestWithUser,
} from '../decorators/current-user.decorator';
export { RequireLicense } from '../decorators/require-license.decorator';
export { LicenseGuard } from '../guards/license.guard';
export { LicenseRole } from '../schemas/license.schema';
