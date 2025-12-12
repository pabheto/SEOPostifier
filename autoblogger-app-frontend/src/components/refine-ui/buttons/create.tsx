"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";

type CreateButtonProps = {
  resource?: string;
  hidden?: boolean;
} & React.ComponentProps<typeof Button>;

export const CreateButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  CreateButtonProps
>(({ resource, hidden, children, onClick, ...rest }, ref) => {
  if (hidden) return null;

  const href = resource ? `/${resource}/create` : "/create";

  return (
    <Button {...rest} ref={ref} asChild>
      <Link href={href} onClick={onClick as any}>
        {children ?? (
          <div className="flex items-center gap-2 font-semibold">
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </div>
        )}
      </Link>
    </Button>
  );
});

CreateButton.displayName = "CreateButton";
