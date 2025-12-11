"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface Subscription {
  plan: string;
  status: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface BillingPeriod {
  start: string;
  end: string;
}

export interface Usage {
  aiGeneratedImages: number;
  generatedWords: number;
}

export interface SubscriptionAndUsage {
  subscription: Subscription;
  billingPeriod: BillingPeriod;
  usage: Usage;
}

export const useSubscription = () => {
  return useQuery<SubscriptionAndUsage>({
    queryKey: ["subscription", "current"],
    queryFn: () =>
      apiClient.get<SubscriptionAndUsage>("/subscriptions/current"),
  });
};



