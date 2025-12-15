import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  forwardRef,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AVAILABLE_PLANS } from '../subscriptions/plans/plans.definition';
import { SubscriptionService } from '../subscriptions/subscription.service';
import type { AuthenticatedUser } from '../users/auth';
import { CurrentUser, RequireAuth } from '../users/auth';
import { ActivateLicenseDto } from './dto/activate-license.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { LicensesService } from './licenses.service';

@ApiTags('licenses')
@Controller('licenses')
export class LicensesController {
  constructor(
    private readonly licensesService: LicensesService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get()
  @RequireAuth()
  @ApiOperation({ summary: 'Get all licenses for the current user' })
  async getLicenses(@CurrentUser() user: AuthenticatedUser) {
    return this.licensesService.getLicensesForUser(user.id);
  }

  @Post()
  @RequireAuth()
  @ApiOperation({ summary: 'Create a new license for the current user' })
  async createLicense(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLicenseDto,
  ) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('License name is required');
    }

    // Get user's subscription to check plan limits
    const subscription =
      await this.subscriptionService.getOrCreateSubscriptionForUser(user.id);
    const plan = AVAILABLE_PLANS[subscription.plan];

    if (!plan) {
      throw new BadRequestException('Invalid subscription plan');
    }

    // Check if user has reached maximum active licenses
    const licenses = await this.licensesService.getLicensesForUser(user.id);
    const activatedLicenses = licenses.filter((l) => l.activated);

    if (activatedLicenses.length >= plan.maximumActiveLicenses) {
      throw new BadRequestException(
        `You have reached the maximum number of activated licenses (${plan.maximumActiveLicenses}) for your ${plan.name} plan.`,
      );
    }

    return this.licensesService.createLicenseForUser(user.id, dto.name.trim());
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate a license for a specific site' })
  async activateLicense(@Body() dto: ActivateLicenseDto) {
    return this.licensesService.activateLicense(dto.licenseKey, dto.siteUrl);
  }

  @Delete(':id')
  @RequireAuth()
  @ApiOperation({ summary: 'Delete a license' })
  async deleteLicense(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') licenseId: string,
  ) {
    return this.licensesService.deleteLicense(licenseId, user.id);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get license details by key' })
  async getLicenseByKey(@Param('key') licenseKey: string) {
    return this.licensesService.getLicenseByKey(licenseKey);
  }
}
