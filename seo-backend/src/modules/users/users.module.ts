import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LicensesModule } from '../licenses/licenses.module';
import { AuthHelper } from './auth.helper';
import { JwtGuard } from './guards/jwt.guard';
import { LicenseGuard } from './guards/license.guard';
import { RoleGuard } from './guards/role.guard';
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
    forwardRef(() => LicensesModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthHelper, LicenseGuard, JwtGuard, RoleGuard],
  exports: [
    UsersService,
    AuthHelper,
    LicenseGuard,
    JwtGuard,
    RoleGuard,
    MongooseModule,
  ],
})
export class UsersModule {}
