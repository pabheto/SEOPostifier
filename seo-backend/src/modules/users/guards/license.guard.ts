import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthHelper } from '../auth.helper';
import { LicenseRole } from '../schemas/license.schema';

export const REQUIRE_LICENSE_KEY = 'requireLicense';
export const LICENSE_ROLES_KEY = 'licenseRoles';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route requires license validation
    const requireLicense = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_LICENSE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no license requirement, allow access
    if (!requireLicense) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('License key is required');
    }

    // Extract license key from header (format: "Bearer LICENSE_KEY" or just "LICENSE_KEY")
    const licenseKey = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!licenseKey) {
      throw new UnauthorizedException('Invalid license key format');
    }

    try {
      // Validate license and get user
      const { user, license } = await this.authHelper.getUserByLicense(
        licenseKey,
      );

      // Check if specific roles are required
      const requiredRoles = this.reflector.getAllAndOverride<LicenseRole[]>(
        LICENSE_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(license.role)) {
          throw new UnauthorizedException(
            `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
          );
        }
      }

      // Attach user and license info to request
      request.user = user;
      request.license = license;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid license key');
    }
  }
}

