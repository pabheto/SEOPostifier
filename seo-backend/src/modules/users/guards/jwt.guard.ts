import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users.service';

export const REQUIRE_AUTH_KEY = 'requireAuth';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route requires authentication
    const requireAuth = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no auth requirement, allow access
    if (!requireAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string; email: string; role: string };
    }>();
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Extract JWT token from header (format: "Bearer TOKEN")
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Validate session and get user
      const sessionData = await this.usersService.validateSession(token);

      // Attach user info to request
      request.user = {
        id: String(sessionData.user.id),
        email: sessionData.user.email,
        role: sessionData.user.role,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
