"use client";

import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Convert system theme to actual light/dark
  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setCurrentTheme(systemTheme);
    } else {
      setCurrentTheme(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    if (currentTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full",
        "border-sidebar-border",
        "bg-transparent",
        "relative",
        "overflow-hidden",
        className,
        "h-10",
        "w-10"
      )}
    >
      <div className="relative h-[1.2rem] w-[1.2rem] flex items-center justify-center">
        <Sun
          className={cn(
            "absolute",
            "h-[1.2rem]",
            "w-[1.2rem]",
            "transition-all",
            "duration-200",
            "pointer-events-none",
            currentTheme === "light"
              ? "rotate-0 scale-100 opacity-100 z-10"
              : "rotate-90 scale-0 opacity-0 -z-10"
          )}
        />
        <Moon
          className={cn(
            "absolute",
            "h-[1.2rem]",
            "w-[1.2rem]",
            "transition-all",
            "duration-200",
            "pointer-events-none",
            currentTheme === "dark"
              ? "rotate-0 scale-100 opacity-100 z-10"
              : "rotate-90 scale-0 opacity-0 -z-10"
          )}
        />
      </div>
      <span className="sr-only">Toggle theme (Light ↔ Dark)</span>
    </Button>
  );
}

ThemeToggle.displayName = "ThemeToggle";
