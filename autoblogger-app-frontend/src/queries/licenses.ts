"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface License {
  id: string;
  key: string;
  name: string;
  activated: boolean;
  activatedForSite?: string | null;
  activatedAt?: string | null;
  createdAt: string;
}

export const useLicenses = () => {
  return useQuery<License[]>({
    queryKey: ["licenses"],
    queryFn: () => apiClient.get<License[]>("/licenses"),
  });
};

export const useCreateLicense = () => {
  const queryClient = useQueryClient();

  return useMutation<License, Error, { name: string }>({
    mutationFn: (data) => apiClient.post<License>("/licenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
};



