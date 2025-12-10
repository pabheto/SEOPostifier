import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

export const REQUIRE_SESSION_KEY = 'requireSession';

interface Auth0TokenPayload {
  sub: string; // Auth0 user ID (format: auth0|... or email|...)
  email?: string;
  email_verified?: boolean;
  aud?: string | string[];
  iss?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

@Injectable()
export class SessionGuard implements CanActivate {
  private jwksClient: jwksClient.JwksClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN');
    if (!auth0Domain) {
      throw new Error('AUTH0_DOMAIN environment variable is required');
    }

    this.jwksClient = jwksClient.default({
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route requires session validation
    const requireSession = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_SESSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no session requirement, allow access
    if (!requireSession) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is required');
    }

    // Extract token from header (format: "Bearer TOKEN")
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      throw new UnauthorizedException('Invalid authorization token format');
    }

    try {
      // Verify and decode the token
      const decoded = await this.verifyToken(token);

      // Extract user information from token
      const userId = this.extractUserId(decoded.sub);
      const email = decoded.email;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: user ID not found');
      }

      // Attach user info to request
      request.user = {
        id: userId,
        email: email || '',
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async verifyToken(token: string): Promise<Auth0TokenPayload> {
    const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN');
    const auth0Audience = this.configService.get<string>('AUTH0_AUDIENCE');

    return new Promise((resolve, reject) => {
      // Get the signing key
      jwt.verify(
        token,
        async (header, callback) => {
          try {
            const key = await this.jwksClient.getSigningKey(header.kid);
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
          } catch (error) {
            callback(error as Error);
          }
        },
        {
          audience: auth0Audience,
          issuer: `https://${auth0Domain}/`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as Auth0TokenPayload);
          }
        },
      );
    });
  }

  private extractUserId(sub: string): string | null {
    // Auth0 sub format can be:
    // - "auth0|userId" for database connections
    // - "email|email@example.com" for email connections
    // - "provider|userId" for social connections
    // We'll use the sub as-is, or extract the part after the pipe
    if (!sub) {
      return null;
    }

    // For database connections, use the part after the pipe
    if (sub.includes('|')) {
      return sub.split('|')[1];
    }

    return sub;
  }
}

