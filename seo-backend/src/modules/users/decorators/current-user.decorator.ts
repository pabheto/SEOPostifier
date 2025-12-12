import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { UserRole } from '../enums/role.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface RequestWithUser {
  user?: AuthenticatedUser;
  license?: {
    key: string;
    name: string;
  };
}

/**
 * Decorator to extract the current authenticated user from the request
 * Must be used in combination with @RequireLicense() decorator
 *
 * @example
 * ```typescript
 * @RequireLicense()
 * async myEndpoint(@CurrentUser() user: AuthenticatedUser) {
 *   console.log(user.id, user.email);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

/**
 * Decorator to extract the current license from the request
 * Must be used in combination with @RequireLicense() decorator
 *
 * @example
 * ```typescript
 * @RequireLicense()
 * async myEndpoint(@CurrentLicense() license) {
 *   console.log(license.key, license.name);
 * }
 * ```
 */
export const CurrentLicense = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.license;
  },
);
