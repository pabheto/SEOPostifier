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
export { RequireSession } from '../decorators/require-session.decorator';
export { LicenseGuard } from '../guards/license.guard';
export { SessionGuard } from '../guards/session.guard';
export { LicenseRole } from '../schemas/license.schema';
