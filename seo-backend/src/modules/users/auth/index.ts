// Export all authentication-related decorators, guards, and types
export { RequireLicense } from '../decorators/require-license.decorator';
export {
  CurrentUser,
  CurrentLicense,
} from '../decorators/current-user.decorator';
export type {
  AuthenticatedUser,
  RequestWithUser,
} from '../decorators/current-user.decorator';
export { LicenseGuard } from '../guards/license.guard';
export { LicenseRole } from '../schemas/license.schema';

