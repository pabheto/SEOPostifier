import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  forwardRef,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AVAILABLE_PLANS } from '../subscriptions/plans/plans.definition';
import { SubscriptionService } from '../subscriptions/subscription.service';
import type { AuthenticatedUser } from './auth';
import { CurrentUser, RequireAuth } from './auth';
import { AuthHelper } from './auth.helper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authHelper: AuthHelper,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  logout(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.usersService.logout(token);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate session token' })
  validateSession(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.usersService.validateSession(token);
  }

  @Post('auth/license')
  @ApiOperation({ summary: 'Get user by license key' })
  getUserByLicense(@Body('licenseKey') licenseKey: string) {
    return this.authHelper.getUserByLicense(licenseKey);
  }

  @Get('licenses')
  @RequireAuth()
  @ApiOperation({ summary: 'Get all licenses for the current user' })
  getLicenses(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getLicensesForUser(user.id);
  }

  @Post('licenses')
  @RequireAuth()
  @ApiOperation({ summary: 'Create a new license for the current user' })
  async createLicense(
    @CurrentUser() user: AuthenticatedUser,
    @Body('name') name: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('License name is required');
    }

    // Get user's subscription to check plan limits
    const subscription =
      await this.subscriptionService.getOrCreateSubscriptionForUser(user.id);
    const plan = AVAILABLE_PLANS.find(
      (p) => p.identifier === subscription.plan,
    );

    if (!plan) {
      throw new BadRequestException('Invalid subscription plan');
    }

    // Check if user has reached maximum active licenses
    const licenses = await this.usersService.getLicensesForUser(user.id);
    const activeLicenses = licenses.filter((l) => l.active);

    if (activeLicenses.length >= plan.maximumActiveLicenses) {
      throw new BadRequestException(
        `You have reached the maximum number of active licenses (${plan.maximumActiveLicenses}) for your ${plan.name} plan.`,
      );
    }

    return this.usersService.createLicenseForUser(user.id, name.trim());
  }
}
