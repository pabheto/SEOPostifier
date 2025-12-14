import { ToasterWrapper } from "@/components/toaster-wrapper";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import { AppContext } from "./_refine_context";

export const metadata: Metadata = {
  title: "AI autoblogger",
  description: "AI autoblogger Dashboard",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <html lang="en" className={defaultMode} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('refine-ui-theme') || '${defaultMode}';
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <Suspense>
          <AppContext defaultMode={defaultMode}>{children}</AppContext>
        </Suspense>
        <ToasterWrapper />
      </body>
    </html>
  );
}
