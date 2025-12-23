import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PlanIdentifier } from '../plans/plans.definition';

export enum BillingPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'The plan identifier to subscribe to',
    enum: PlanIdentifier,
    example: PlanIdentifier.BASIC,
  })
  @IsEnum(PlanIdentifier)
  @IsNotEmpty()
  plan: PlanIdentifier;

  @ApiProperty({
    description: 'Billing period (monthly or annual)',
    enum: BillingPeriod,
    example: BillingPeriod.MONTHLY,
  })
  @IsEnum(BillingPeriod)
  @IsNotEmpty()
  billingPeriod: BillingPeriod;
}






