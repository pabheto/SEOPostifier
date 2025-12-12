"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default function NotFound() {
  return (
    <Suspense>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page Not Found</p>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </Suspense>
  );
}
