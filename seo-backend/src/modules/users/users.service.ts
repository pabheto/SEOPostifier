import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { LicensesService } from '../licenses/licenses.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Session } from './schemas/session.schema';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
  private readonly sessionExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @Inject(forwardRef(() => LicensesService))
    private licensesService: LicensesService,
  ) {}

  async register(dto: RegisterDto) {
    // Additional security check: email must start with admin_1869
    /* if (!dto.email.startsWith('admin_1869')) {
      throw new BadRequestException('Registration is restricted');
    } */

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const appUserId = randomUUID();
    const user = await this.userModel.create({
      appUserId,
      email: dto.email,
      password: hashedPassword,
    });

    // Create session
    const sessionToken = this.generateSessionToken();
    const session = await this.sessionModel.create({
      userId: appUserId,
      token: sessionToken,
      expiresAt: new Date(Date.now() + this.sessionExpiry),
    });

    // JWT contains session reference
    const token = jwt.sign(
      { userId: appUserId, sessionId: session._id.toString() },
      this.jwtSecret,
    );

    return {
      token,
      user: {
        id: appUserId,
        email: user.email,
        role: user.role || 'USER',
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Backfill appUserId for existing users created before migration
    if (!user.appUserId) {
      user.appUserId = randomUUID();
      await user.save();
    }

    // Create new session
    const sessionToken = this.generateSessionToken();
    const session = await this.sessionModel.create({
      userId: user.appUserId,
      token: sessionToken,
      expiresAt: new Date(Date.now() + this.sessionExpiry),
    });

    // JWT contains session reference
    const token = jwt.sign(
      { userId: user.appUserId, sessionId: session._id.toString() },
      this.jwtSecret,
    );

    return {
      token,
      user: {
        id: user.appUserId,
        email: user.email,
        role: user.role || 'USER',
      },
    };
  }

  async logout(token: string) {
    const decoded = jwt.verify(token, this.jwtSecret) as {
      userId: string;
      sessionId: string;
    };
    // Delete session from database
    await this.sessionModel.findByIdAndDelete(decoded.sessionId);
    return { message: 'Logged out successfully' };
  }

  async validateSession(token: string) {
    const decoded = jwt.verify(token, this.jwtSecret) as {
      userId: string;
      sessionId: string;
    };

    const session = await this.sessionModel.findById(decoded.sessionId);
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = await this.userModel.findOne({ appUserId: decoded.userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: user.appUserId,
        email: user.email,
        role: user.role || 'USER',
      },
      sessionId: String(session._id),
    };
  }

  private generateSessionToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
  }
}
