"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/queries/subscriptions";
import { FileText, Image } from "lucide-react";

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
    <div className="min-h-screen p-6 md:p-8 lg:p-10 bg-background">
      <div className="mb-10 max-w-7xl mx-auto">
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
            {!isLoading && subscription?.plan && (
              <Badge
                variant={getPlanColor(subscription.plan) as any}
                className="text-xs font-semibold px-3 py-1"
              >
                {subscription.plan.toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg">
            Overview of your usage and subscription
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/50">
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
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 hover:border-border transition-colors shadow-sm hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Image className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      AI Generated Images
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-semibold tracking-tight">
                    {usage?.aiGeneratedImages || 0}{" "}
                    <span className="text-2xl text-muted-foreground font-normal">
                      / {limits.images}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={imagesUsagePercent} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {limits.images - (usage?.aiGeneratedImages || 0)} images
                      remaining
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-border transition-colors shadow-sm hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      Generated Words
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-semibold tracking-tight">
                    {usage?.generatedWords || 0}{" "}
                    <span className="text-2xl text-muted-foreground font-normal">
                      / {limits.words.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={wordsUsagePercent} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {(
                        limits.words - (usage?.generatedWords || 0)
                      ).toLocaleString()}{" "}
                      words remaining
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
