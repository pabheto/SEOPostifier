"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCancelSubscription,
  useCreateCheckout,
  useCustomerPortal,
  useSubscription,
  type BillingPeriod,
} from "@/queries/subscriptions";
import { Calendar, CheckCircle2, CreditCard, DollarSign } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useSubscription();
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

  const planPricing: Record<
    string,
    {
      monthly: number;
      annual: number;
      name: string;
      color: string;
      identifier: "free" | "basic" | "premium" | "agency";
      features: string[];
    }
  > = {
    free: {
      monthly: 0,
      annual: 0,
      name: "Free",
      color: "secondary",
      identifier: "free",
      features: ["16 AI images/month", "10,000 words/month", "1 license"],
    },
    basic: {
      monthly: 10,
      annual: 99,
      name: "Basic",
      color: "default",
      identifier: "basic",
      features: ["64 AI images/month", "50,000 words/month", "1 license"],
    },
    premium: {
      monthly: 20,
      annual: 199,
      name: "Premium",
      color: "default",
      identifier: "premium",
      features: ["128 AI images/month", "100,000 words/month", "1 license"],
    },
    agency: {
      monthly: 50,
      annual: 499,
      name: "Agency",
      color: "default",
      identifier: "agency",
      features: ["256 AI images/month", "100,000 words/month", "1 license"],
    },
  };

  const currentPlan =
    planPricing[subscription?.plan || "free"] || planPricing.free;

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

  const plansToShow = Object.values(planPricing).filter(
    (plan) => plan.identifier !== "free"
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-background to-muted/20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Billing</h2>
        <p className="text-muted-foreground text-base">
          Manage your subscription and billing information
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
            <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
                <div className="text-2xl font-bold text-primary mb-2">
                  {currentPlan.monthly > 0
                    ? `$${currentPlan.monthly}/month`
                    : "Free"}
                </div>
                <Badge variant={currentPlan.color as any} className="mt-2">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
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
                    ? new Date(billingPeriod.start).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )
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

          {/* Billing Period Toggle */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Billing Period:</span>
                <Button
                  variant={
                    selectedBillingPeriod === "monthly" ? "default" : "outline"
                  }
                  onClick={() => setSelectedBillingPeriod("monthly")}
                >
                  Monthly
                </Button>
                <Button
                  variant={
                    selectedBillingPeriod === "annual" ? "default" : "outline"
                  }
                  onClick={() => setSelectedBillingPeriod("annual")}
                >
                  Annual
                  <Badge variant="secondary" className="ml-2">
                    Save up to 17%
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  className={`hover:shadow-md transition-shadow h-full flex flex-col ${
                    isCurrentPlan ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                      <Badge
                        variant={plan.color as any}
                        className="text-sm px-3 py-1"
                      >
                        {plan.name}
                      </Badge>
                      {isCurrentPlan && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {priceLabel}
                    </div>
                    {selectedBillingPeriod === "annual" && plan.monthly > 0 && (
                      <p className="text-sm text-muted-foreground">
                        ${(plan.annual / 12).toFixed(2)}/month billed annually
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant={isCurrentPlan ? "outline" : "default"}
                      className="w-full mt-auto"
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manage Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage your subscription, payment methods, and billing history
                  through the Stripe customer portal.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCustomerPortal}
                    disabled={customerPortal.isPending}
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
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
