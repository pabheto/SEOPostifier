import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthHelper } from './auth.helper';
import { LicenseGuard } from './guards/license.guard';
import { SessionGuard } from './guards/session.guard';
import { License, LicenseSchema } from './schemas/license.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: License.name, schema: LicenseSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthHelper, LicenseGuard, SessionGuard],
  exports: [UsersService, AuthHelper, LicenseGuard, SessionGuard],
})
export class UsersModule {}
