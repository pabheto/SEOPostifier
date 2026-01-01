import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsGenerationModule } from '../posts-generation/posts-generation.module';
import { PostsManagementModule } from '../posts-management/posts-management.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    PostsManagementModule,
    PostsGenerationModule,
  ],
  controllers: [AdministrationController],
  providers: [AdministrationService],
  exports: [AdministrationService],
})
export class AdministrationModule {}
