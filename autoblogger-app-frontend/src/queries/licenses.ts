"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface License {
  id: string;
  key: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useLicenses = () => {
  return useQuery<License[]>({
    queryKey: ["licenses"],
    queryFn: () => apiClient.get<License[]>("/users/licenses"),
  });
};

export const useCreateLicense = () => {
  const queryClient = useQueryClient();

  return useMutation<License, Error, { role: string }>({
    mutationFn: (data) => apiClient.post<License>("/users/licenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
};
