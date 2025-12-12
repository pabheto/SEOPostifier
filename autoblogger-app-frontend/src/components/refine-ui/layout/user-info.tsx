"use client";

import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return (
      <div className={cn("flex", "items-center", "gap-x-2")}>
        <Skeleton className={cn("h-10", "w-10", "rounded-full")} />
        <div className={cn("flex", "flex-col", "justify-between", "h-10")}>
          <Skeleton className={cn("h-4", "w-32")} />
          <Skeleton className={cn("h-4", "w-24")} />
        </div>
      </div>
    );
  }

  const user = session.user;
  const name = user.email || "";
  const email = user.email || "";
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className={cn("flex", "items-center", "gap-x-2")}>
      <UserAvatar />
      <div
        className={cn(
          "flex",
          "flex-col",
          "justify-between",
          "h-10",
          "text-left"
        )}
      >
        <span className={cn("text-sm", "font-medium", "text-muted-foreground")}>
          {firstName} {lastName}
        </span>
        <span className={cn("text-xs", "text-muted-foreground")}>{email}</span>
      </div>
    </div>
  );
}

UserInfo.displayName = "UserInfo";
