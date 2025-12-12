"use client";

import { useSubscription } from "@/queries/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText, Image } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error } = useSubscription();

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">Error loading dashboard data</p>
      </div>
    );
  }

  const subscription = data?.subscription;
  const usage = data?.usage;
  const billingPeriod = data?.billingPeriod;

  const planLimits: Record<string, { images: number; words: number }> = {
    free: { images: 16, words: 10000 },
    basic: { images: 64, words: 50000 },
    premium: { images: 128, words: 100000 },
    agency: { images: 256, words: 100000 },
  };

  const limits = planLimits[subscription?.plan || "free"] || planLimits.free;
  const imagesUsagePercent = Math.min(
    ((usage?.aiGeneratedImages || 0) / limits.images) * 100,
    100
  );
  const wordsUsagePercent = Math.min(
    ((usage?.generatedWords || 0) / limits.words) * 100,
    100
  );

  const getPlanColor = (plan: string) => {
    const colors: Record<string, string> = {
      free: "secondary",
      basic: "default",
      premium: "default",
      agency: "default",
    };
    return colors[plan] || "secondary";
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-background to-muted/20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground text-base">
          Overview of your subscription and usage
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <p className="text-sm text-muted-foreground">Current Plan</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getPlanColor(subscription?.plan || "free") as any}>
                    {subscription?.plan?.toUpperCase() || "FREE"}
                  </Badge>
                  <span className="text-2xl font-bold">
                    {subscription?.plan?.toUpperCase() || "FREE"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Billing Period Start
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  {billingPeriod?.start
                    ? new Date(billingPeriod.start).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Billing Period End
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  {billingPeriod?.end
                    ? new Date(billingPeriod.end).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  <CardTitle>AI Generated Images</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  {usage?.aiGeneratedImages || 0} / {limits.images}
                </div>
                <Progress
                  value={imagesUsagePercent}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  {limits.images - (usage?.aiGeneratedImages || 0)} images
                  remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Generated Words</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  {usage?.generatedWords || 0} / {limits.words.toLocaleString()}
                </div>
                <Progress
                  value={wordsUsagePercent}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  {(limits.words - (usage?.generatedWords || 0)).toLocaleString()}{" "}
                  words remaining
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

