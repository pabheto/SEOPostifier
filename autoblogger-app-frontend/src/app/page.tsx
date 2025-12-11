"use client";

import { Authenticated } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <Authenticated key="home-page">
      <div>Redirecting to dashboard...</div>
    </Authenticated>
  );
}
