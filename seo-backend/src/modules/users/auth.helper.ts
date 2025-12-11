import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { License } from './schemas/license.schema';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthHelper {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(License.name) private licenseModel: Model<License>,
  ) {}

  async getUserByLicense(licenseKey: string) {
    const license = await this.licenseModel.findOne({ key: licenseKey });
    if (!license || !license.active) {
      throw new UnauthorizedException('Invalid or inactive license');
    }

    const user = await this.userModel.findById(license.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: { id: user._id, email: user.email },
      license: { key: license.key, name: license.name },
    };
  }
}
