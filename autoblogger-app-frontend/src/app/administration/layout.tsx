import authOptions from "@/app/api/auth/[...nextauth]/options";
import { Layout } from "@/components/refine-ui/layout/layout";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdministrationLayout({
  children,
}: React.PropsWithChildren) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    return redirect("/dashboard");
  }

  return <Layout>{children}</Layout>;
}






