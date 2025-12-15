export interface PlanDefinition {
  identifier: PlanIdentifier;
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
  PARTNER = 'partner',
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
  monthlyPrice: 19,
  anualPrice: 197,
  aiImageGenerationPerMonth: 6,
  generatedWordsPerMonth: 24000,
  maximumActiveLicenses: 1,
};

export const PREMIUM_PLAN: PlanDefinition = {
  identifier: PlanIdentifier.PREMIUM,
  name: 'Business',
  description: 'Business plan',
  monthlyPrice: 29,
  anualPrice: 287,
  aiImageGenerationPerMonth: 144,
  generatedWordsPerMonth: 72000,
  maximumActiveLicenses: 3,
};

export const AGENCY_PLAN: PlanDefinition = {
  identifier: PlanIdentifier.AGENCY,
  name: 'Agency',
  description: 'Agency plan',
  monthlyPrice: 79,
  anualPrice: 787,
  aiImageGenerationPerMonth: 360,
  generatedWordsPerMonth: 180000,
  maximumActiveLicenses: 10,
};

export const PARTNER_PLAN: PlanDefinition = {
  identifier: PlanIdentifier.PARTNER,
  name: 'Partner',
  description: 'Partner plan',
  monthlyPrice: 0,
  anualPrice: 0,
  aiImageGenerationPerMonth: 1000,
  generatedWordsPerMonth: 1000000,
  maximumActiveLicenses: 30,
};

export const AVAILABLE_PLANS: {
  [key in PlanIdentifier]: PlanDefinition;
} = {
  [PlanIdentifier.FREE]: FREE_PLAN,
  [PlanIdentifier.BASIC]: BASIC_PLAN,
  [PlanIdentifier.PREMIUM]: PREMIUM_PLAN,
  [PlanIdentifier.AGENCY]: AGENCY_PLAN,
  [PlanIdentifier.PARTNER]: PARTNER_PLAN,
};

export const DEFAULT_PLAN: PlanDefinition = FREE_PLAN;
