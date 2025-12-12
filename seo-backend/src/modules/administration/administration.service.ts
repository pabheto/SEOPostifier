import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getAllUsers() {
    const users = await this.userModel
      .find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'USER',
    }));
  }

  async getUserById(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'USER',
    };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    );

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'USER',
    };
  }
}
