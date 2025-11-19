import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { License, LicenseRole } from './schemas/license.schema';
import { Session } from './schemas/session.schema';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
  private readonly sessionExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(License.name) private licenseModel: Model<License>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: dto.email,
      password: hashedPassword,
    });

    // Create a default BASIC license
    const licenseKey = this.generateLicenseKey();
    const license = await this.licenseModel.create({
      userId: user._id,
      role: LicenseRole.BASIC,
      key: licenseKey,
    });

    // Create session
    const sessionToken = this.generateSessionToken();
    const session = await this.sessionModel.create({
      userId: user._id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + this.sessionExpiry),
    });

    // JWT contains session reference
    const token = jwt.sign(
      { userId: user._id, sessionId: session._id },
      this.jwtSecret,
    );

    return {
      token,
      user: { id: user._id, email: user.email },
      license: { key: license.key, role: license.role },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const license = await this.licenseModel.findOne({ userId: user._id });

    // Create new session
    const sessionToken = this.generateSessionToken();
    const session = await this.sessionModel.create({
      userId: user._id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + this.sessionExpiry),
    });

    // JWT contains session reference
    const token = jwt.sign(
      { userId: user._id, sessionId: session._id },
      this.jwtSecret,
    );

    return {
      token,
      user: { id: user._id, email: user.email },
      license: license ? { key: license.key, role: license.role } : null,
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

    const user = await this.userModel.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: { id: user._id, email: user.email },
      sessionId: session._id,
    };
  }

  private generateSessionToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateLicenseKey(): string {
    return `BASIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}
