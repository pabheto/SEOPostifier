import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireRole } from '../users/auth';
import { UserRole } from '../users/enums/role.enum';
import { AdministrationService } from './administration.service';

@ApiTags('administration')
@Controller('administration')
@RequireRole(UserRole.ADMIN)
export class AdministrationController {
  constructor(private readonly administrationService: AdministrationService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  getAllUsers() {
    return this.administrationService.getAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  getUserById(@Param('id') id: string) {
    return this.administrationService.getUserById(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    if (
      !role ||
      (role !== (UserRole.USER as string) &&
        role !== (UserRole.ADMIN as string))
    ) {
      throw new BadRequestException('Invalid role. Must be USER or ADMIN');
    }
    return this.administrationService.updateUserRole(id, role);
  }
}
