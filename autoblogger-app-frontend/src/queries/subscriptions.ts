"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface Subscription {
  plan: string;
  status: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface BillingPeriodData {
  start: string;
  end: string;
}

export interface Usage {
  aiGeneratedImages: number;
  generatedWords: number;
}

export interface SubscriptionAndUsage {
  subscription: Subscription;
  billingPeriod: BillingPeriodData;
  usage: Usage;
}

export const useSubscription = () => {
  return useQuery<SubscriptionAndUsage>({
    queryKey: ["subscription", "current"],
    queryFn: () =>
      apiClient.get<SubscriptionAndUsage>("/subscriptions/current"),
  });
};

export type PlanIdentifier = "free" | "basic" | "premium" | "agency";
export type BillingPeriod = "monthly" | "annual";

export interface CreateCheckoutRequest {
  plan: PlanIdentifier;
  billingPeriod: BillingPeriod;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export const useCreateCheckout = () => {
  return useMutation<CreateCheckoutResponse, Error, CreateCheckoutRequest>({
    mutationFn: (data) =>
      apiClient.post<CreateCheckoutResponse>("/subscriptions/checkout", data),
  });
};

export const useCustomerPortal = () => {
  return useMutation<CustomerPortalResponse, Error, void>({
    mutationFn: () =>
      apiClient.get<CustomerPortalResponse>("/subscriptions/portal"),
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => apiClient.post<void>("/subscriptions/cancel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};
