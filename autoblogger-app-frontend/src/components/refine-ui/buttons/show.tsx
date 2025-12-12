"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import React from "react";
import Link from "next/link";

type ShowButtonProps = {
  recordItemId?: string;
  resource?: string;
  size?: "sm" | "md" | "lg" | "icon" | "default";
  hidden?: boolean;
} & Omit<React.ComponentProps<typeof Button>, 'onClick'> & {
  onClick?: (e: any) => void;
};

export const ShowButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  ShowButtonProps
>(
  ({ recordItemId, resource = "blog-posts", size = "sm", hidden, children, onClick, ...rest }, ref) => {
    if (hidden) return null;

    const href = `/${resource}/show/${recordItemId}`;

    return (
      <Button {...rest} ref={ref} size={size} asChild>
        <Link href={href} onClick={onClick}>
          {children ?? (
            <div className="flex items-center gap-2 font-semibold">
              <Eye className="h-4 w-4" />
              <span>Show</span>
            </div>
          )}
        </Link>
      </Button>
    );
  }
);

ShowButton.displayName = "ShowButton";
