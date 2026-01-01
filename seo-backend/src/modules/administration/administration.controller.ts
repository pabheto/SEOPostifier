import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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

  @Get('post-interviews')
  @ApiOperation({
    summary: 'Get all post interviews with pagination (Admin only)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  getAllPostInterviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    if (limitNum > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    return this.administrationService.getAllPostInterviews(pageNum, limitNum);
  }

  @Get('post-interviews/:interviewId/content')
  @ApiOperation({ summary: 'Get post content by interview ID (Admin only)' })
  getPostContentByInterviewId(@Param('interviewId') interviewId: string) {
    return this.administrationService.getPostContentByInterviewId(interviewId);
  }

  @Get('post-interviews/:interviewId/pipeline-context')
  @ApiOperation({
    summary: 'Get pipeline context by interview ID (Admin only)',
  })
  getPipelineContextByInterviewId(@Param('interviewId') interviewId: string) {
    return this.administrationService.getPipelineContextByInterviewId(
      interviewId,
    );
  }
}
