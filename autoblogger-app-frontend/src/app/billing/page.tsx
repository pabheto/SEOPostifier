"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAvailablePlans,
  useCancelSubscription,
  useCreateCheckout,
  useCustomerPortal,
  useSubscription,
  type BillingPeriod,
} from "@/queries/subscriptions";
import { useCurrentUser, type PlanDefinition } from "@/queries/users";
import { Calendar, CheckCircle2, CreditCard, DollarSign } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useSubscription();
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const { data: plansData, isLoading: isPlansLoading } = useAvailablePlans();
  const createCheckout = useCreateCheckout();
  const customerPortal = useCustomerPortal();
  const cancelSubscription = useCancelSubscription();
  const [selectedBillingPeriod, setSelectedBillingPeriod] =
    useState<BillingPeriod>("monthly");

  // Handle Stripe redirects
  useEffect(() => {
    const success = searchParams?.get("success");
    const canceled = searchParams?.get("canceled");

    if (success === "true") {
      toast.success("Subscription activated successfully!");
      refetch();
      // Clean URL
      window.history.replaceState({}, "", "/billing");
    } else if (canceled === "true") {
      toast.info("Checkout was canceled");
      // Clean URL
      window.history.replaceState({}, "", "/billing");
    }
  }, [searchParams, refetch]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">Error loading billing data</p>
      </div>
    );
  }

  const subscription = data?.subscription;
  const billingPeriod = data?.billingPeriod;
  const currentUserPlan = userData?.plan;
  const availablePlans = plansData?.plans || [];

  // Helper function to get plan color
  const getPlanColor = (identifier: string) => {
    if (identifier === "free") return "secondary";
    return "default";
  };

  // Helper function to format plan features
  const formatPlanFeatures = (plan: PlanDefinition | undefined) => {
    if (!plan) return [];
    return [
      `${plan.aiImageGenerationPerMonth.toLocaleString()} AI images/month`,
      `${plan.generatedWordsPerMonth.toLocaleString()} words/month`,
      `${plan.maximumActiveLicenses} license${
        plan.maximumActiveLicenses !== 1 ? "s" : ""
      }`,
    ];
  };

  // Get current plan from available plans or user data
  const currentPlan = currentUserPlan
    ? {
        monthly: currentUserPlan.monthlyPrice,
        annual: currentUserPlan.anualPrice,
        name: currentUserPlan.name,
        color: getPlanColor(currentUserPlan.identifier),
        identifier: currentUserPlan.identifier as
          | "free"
          | "basic"
          | "premium"
          | "agency",
        features: formatPlanFeatures(currentUserPlan),
      }
    : {
        monthly: 0,
        annual: 0,
        name: "Free",
        color: "secondary",
        identifier: "free" as const,
        features: [],
      };

  const handleSubscribe = async (
    planIdentifier: "basic" | "premium" | "agency",
    billingPeriod: BillingPeriod
  ) => {
    try {
      const response = await createCheckout.mutateAsync({
        plan: planIdentifier,
        billingPeriod,
      });
      // Redirect to Stripe checkout
      window.location.href = response.url;
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to create checkout session. Please try again."
      );
    }
  };

  const handleCustomerPortal = async () => {
    try {
      const response = await customerPortal.mutateAsync();
      // Redirect to Stripe customer portal
      window.location.href = response.url;
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to access customer portal. Please try again."
      );
    }
  };

  // Get plans to show (exclude free and partner plans)
  const plansToShow = availablePlans
    .filter((plan) => plan.identifier !== "free")
    .map((plan) => ({
      monthly: plan.monthlyPrice,
      annual: plan.anualPrice,
      name: plan.name,
      color: getPlanColor(plan.identifier),
      identifier: plan.identifier as "basic" | "premium" | "agency",
      features: formatPlanFeatures(plan),
    }));

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Billing
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription and billing information
          </p>
        </div>

        {isLoading || isUserLoading || isPlansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="space-y-8">
            {/* Current Plan Overview - Modern SaaS Style */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Plan Info */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-semibold tracking-tight">
                          {currentPlan.name}
                        </h3>
                        <Badge variant="secondary" className="h-5">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current subscription plan
                      </p>
                    </div>
                  </div>

                  {/* Billing Period */}
                  {billingPeriod && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-border/50">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                        <span className="font-medium">
                          {billingPeriod.start
                            ? new Date(billingPeriod.start).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : "-"}
                        </span>
                        <span className="text-muted-foreground hidden sm:inline">
                          →
                        </span>
                        <span className="font-medium">
                          {billingPeriod.end
                            ? new Date(billingPeriod.end).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Plan Features Summary */}
                {currentPlan.features.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {currentPlan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Period Toggle */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm text-muted-foreground">
                    Billing Period:
                  </span>
                  <Button
                    variant={
                      selectedBillingPeriod === "monthly"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setSelectedBillingPeriod("monthly")}
                    className="font-medium"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={
                      selectedBillingPeriod === "annual" ? "default" : "outline"
                    }
                    onClick={() => setSelectedBillingPeriod("annual")}
                    className="font-medium"
                  >
                    Annual
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Save up to 17%
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plansToShow.map((plan) => {
                const isCurrentPlan = plan.identifier === subscription?.plan;
                const price =
                  selectedBillingPeriod === "monthly"
                    ? plan.monthly
                    : plan.annual;
                const priceLabel =
                  selectedBillingPeriod === "monthly"
                    ? `$${price}/month`
                    : `$${price}/year`;

                return (
                  <Card
                    key={plan.identifier}
                    className={`border-border/50 hover:border-border transition-all h-full flex flex-col shadow-sm hover:shadow-md ${
                      isCurrentPlan
                        ? "ring-2 ring-primary border-primary/20"
                        : ""
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-center mb-4">
                        <Badge
                          variant={plan.color as any}
                          className="text-xs font-semibold px-3 py-1"
                        >
                          {plan.name}
                        </Badge>
                        {isCurrentPlan && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-3xl font-semibold text-primary tracking-tight mb-2">
                        {priceLabel}
                      </div>
                      {selectedBillingPeriod === "annual" &&
                        plan.monthly > 0 && (
                          <p className="text-sm text-muted-foreground">
                            ${(plan.annual / 12).toFixed(2)}/month billed
                            annually
                          </p>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-6 space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm text-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant={isCurrentPlan ? "outline" : "default"}
                        className="w-full mt-auto font-medium"
                        disabled={isCurrentPlan}
                        onClick={() =>
                          handleSubscribe(
                            plan.identifier as "basic" | "premium" | "agency",
                            selectedBillingPeriod
                          )
                        }
                      >
                        {isCurrentPlan ? "Current Plan" : "Subscribe"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Customer Portal & Cancel Subscription */}
            {subscription?.plan !== "free" && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold tracking-tight">
                    Manage Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Manage your subscription, payment methods, and billing
                    history through the Stripe customer portal.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={handleCustomerPortal}
                      disabled={customerPortal.isPending}
                      className="font-medium"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await cancelSubscription.mutateAsync();
                          toast.success("Subscription canceled successfully");
                          refetch();
                        } catch (error: any) {
                          toast.error(
                            error?.message ||
                              "Failed to cancel subscription. Please try again."
                          );
                        }
                      }}
                      disabled={cancelSubscription.isPending}
                      className="font-medium"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
