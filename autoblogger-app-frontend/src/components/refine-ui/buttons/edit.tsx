"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import React from "react";
import Link from "next/link";

type EditButtonProps = {
  recordItemId?: string;
  resource?: string;
  size?: "sm" | "md" | "lg" | "icon" | "default";
  hidden?: boolean;
} & React.ComponentProps<typeof Button>;

export const EditButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  EditButtonProps
>(
  ({ recordItemId, resource = "blog-posts", size = "sm", hidden, children, onClick, ...rest }, ref) => {
    if (hidden) return null;

    const href = `/${resource}/edit/${recordItemId}`;

    return (
      <Button {...rest} ref={ref} size={size} asChild>
        <Link href={href} onClick={onClick as any}>
          {children ?? (
            <div className="flex items-center gap-2 font-semibold">
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </div>
          )}
        </Link>
      </Button>
    );
  }
);

EditButton.displayName = "EditButton";
