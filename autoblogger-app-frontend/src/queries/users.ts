"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

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

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  plan: PlanDefinition;
}

export const useCurrentUser = () => {
  return useQuery<CurrentUser>({
    queryKey: ["users", "me"],
    queryFn: () => apiClient.get<CurrentUser>("/users/me"),
  });
};







