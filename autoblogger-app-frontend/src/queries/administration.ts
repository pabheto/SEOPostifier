import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  return headers;
}

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["administration", "users"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/administration/users`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/administration/users/${userId}/role`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ role }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administration", "users"] });
    },
  });
}

export interface PostInterview {
  interviewId: string;
  mainKeyword: string;
  status: string;
  userId?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
  hasGeneratedContent: boolean;
  associatedPostId: string | null;
}

export interface PostBlock {
  type: "heading" | "paragraph" | "image" | "faq";
  level?: "h1" | "h2" | "h3" | "h4";
  title?: string;
  content?: string;
  image?: {
    sourceType: string;
    sourceValue?: string;
    title?: string;
    description?: string;
    alt?: string;
  };
  questions?: string[];
  answers?: string[];
}

export interface PostContent {
  interviewId: string;
  postId: string;
  title: string;
  slug?: string;
  mainKeyword?: string;
  secondaryKeywords?: string[];
  language?: string;
  status: string;
  blocks: PostBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPostInterviews {
  data: PostInterview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePostInterviews(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedPostInterviews>({
    queryKey: ["administration", "post-interviews", page, limit],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/administration/post-interviews?page=${page}&limit=${limit}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch post interviews");
      }

      return response.json();
    },
  });
}

export function usePostContent(interviewId: string | null) {
  return useQuery<PostContent>({
    queryKey: ["administration", "post-content", interviewId],
    queryFn: async () => {
      if (!interviewId) {
        throw new Error("Interview ID is required");
      }

      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/administration/post-interviews/${interviewId}/content`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch post content");
      }

      return response.json();
    },
    enabled: !!interviewId,
  });
}
