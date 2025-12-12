"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import React, { useState } from "react";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";

type AppContextProps = {
  defaultMode?: string;
};

export const AppContext = (
  props: React.PropsWithChildren<AppContextProps>
) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider defaultTheme={(props.defaultMode as "light" | "dark" | "system") || "system"}>
          {props.children}
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};
