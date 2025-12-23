"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

export function DebugRole() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;

  return (
    <Card className="mb-4 border-yellow-500">
      <CardHeader>
        <CardTitle>Debug: User Role</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Current Role:</strong> {userRole || "NOT SET"}
        </p>
        <p>
          <strong>Is Admin:</strong> {userRole === "ADMIN" ? "YES" : "NO"}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Full session object: {JSON.stringify(session, null, 2)}
        </p>
      </CardContent>
    </Card>
  );
}





