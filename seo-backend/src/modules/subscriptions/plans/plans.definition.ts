export interface PlanDefinition {
  identifier: string;
  name: string;
  description: string;

  monthlyPrice: number;
  anualPrice: number;

  aiImageGenerationPerMonth: number;
  generatedWordsPerMonth: number;
  maximumActiveLicenses: number;
}

export enum PlanIdentifier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  AGENCY = 'agency',
}

export const FREE_PLAN: PlanDefinition = {
  identifier: PlanIdentifier.FREE,
  name: 'Free',
  description: 'Free plan',
  monthlyPrice: 0,
  anualPrice: 0,
  aiImageGenerationPerMonth: 16,
  generatedWordsPerMonth: 10000,
  maximumActiveLicenses: 1,
};

export const BASIC_PLAN: PlanDefinition = {
  identifier: PlanIdentifier.BASIC,
  name: 'Basic',
  description: 'Basic plan',
  monthlyPrice: 10,
  anualPrice: 99,
  aiImageGenerationPerMonth: 64,
  generatedWordsPerMonth: 50000,
  maximumActiveLicenses: 1,
};

export const PREMIUM_PLAN: PlanDefinition = {
  identifier: PlanIdentifier.PREMIUM,
  name: 'Premium',
  description: 'Premium plan',
  monthlyPrice: 20,
  anualPrice: 199,
  aiImageGenerationPerMonth: 128,
  generatedWordsPerMonth: 100000,
  maximumActiveLicenses: 1,
};

export const AGENCY_PLAN: PlanDefinition = {
  identifier: PlanIdentifier.AGENCY,
  name: 'Agency',
  description: 'Agency plan',
  monthlyPrice: 50,
  anualPrice: 499,
  aiImageGenerationPerMonth: 256,
  generatedWordsPerMonth: 100000,
  maximumActiveLicenses: 1,
};

export const AVAILABLE_PLANS: PlanDefinition[] = [
  FREE_PLAN,
  BASIC_PLAN,
  PREMIUM_PLAN,
  AGENCY_PLAN,
];

export const DEFAULT_PLAN: PlanDefinition = FREE_PLAN;
