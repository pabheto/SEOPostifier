"use client";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  useCancelSubscription,
  useCreateCheckout,
  useCustomerPortal,
  useSubscription,
} from "@queries/subscriptions";
import {
  App,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Tag,
  theme,
  Typography,
} from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function BillingPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useSubscription();
  const createCheckout = useCreateCheckout();
  const customerPortal = useCustomerPortal();
  const cancelSubscription = useCancelSubscription();
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<
    "monthly" | "annual"
  >("monthly");

  // Handle Stripe redirects
  useEffect(() => {
    const success = searchParams?.get("success");
    const canceled = searchParams?.get("canceled");

    if (success === "true") {
      message.success("Subscription activated successfully!");
      refetch();
      // Clean URL
      window.history.replaceState({}, "", "/billing");
    } else if (canceled === "true") {
      message.info("Checkout was canceled");
      // Clean URL
      window.history.replaceState({}, "", "/billing");
    }
  }, [searchParams, refetch]);

  if (error) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <Text type="danger">Error loading billing data</Text>
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
      color: "default",
      identifier: "free",
      features: ["16 AI images/month", "10,000 words/month", "1 license"],
    },
    basic: {
      monthly: 10,
      annual: 99,
      name: "Basic",
      color: "blue",
      identifier: "basic",
      features: ["64 AI images/month", "50,000 words/month", "1 license"],
    },
    premium: {
      monthly: 20,
      annual: 199,
      name: "Premium",
      color: "purple",
      identifier: "premium",
      features: ["128 AI images/month", "100,000 words/month", "1 license"],
    },
    agency: {
      monthly: 50,
      annual: 499,
      name: "Agency",
      color: "gold",
      identifier: "agency",
      features: ["256 AI images/month", "100,000 words/month", "1 license"],
    },
  };

  const currentPlan =
    planPricing[subscription?.plan || "free"] || planPricing.free;

  const handleSubscribe = async (
    planIdentifier: "basic" | "premium" | "agency",
    billingPeriod: "monthly" | "annual"
  ) => {
    try {
      const response = await createCheckout.mutateAsync({
        plan: planIdentifier,
        billingPeriod,
      });
      // Redirect to Stripe checkout
      window.location.href = response.url;
    } catch (error: any) {
      message.error(
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
      message.error(
        error?.message || "Failed to access customer portal. Please try again."
      );
    }
  };

  const plansToShow = Object.values(planPricing).filter(
    (plan) => plan.identifier !== "free"
  );

  return (
    <div
      style={{
        padding: "32px",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorFillQuaternary} 100%)`,
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
          Billing
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Manage your subscription and billing information
        </Text>
      </div>

      {isLoading ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: `1px solid ${token.colorBorderSecondary}`,
                  background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    <DollarOutlined style={{ marginRight: 8 }} />
                    Current Plan
                  </Text>
                </div>
                <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                  {currentPlan.name}
                </Title>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: token.colorPrimary,
                  }}
                >
                  {currentPlan.monthly > 0
                    ? `$${currentPlan.monthly}/month`
                    : "Free"}
                </div>
                <Tag
                  color={currentPlan.color}
                  style={{ marginTop: 12, fontSize: 12 }}
                >
                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                  Active
                </Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Billing Period Start
                  </Text>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: token.colorText,
                  }}
                >
                  {billingPeriod?.start
                    ? new Date(billingPeriod.start).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )
                    : "-"}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Billing Period End
                  </Text>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: token.colorText,
                  }}
                >
                  {billingPeriod?.end
                    ? new Date(billingPeriod.end).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Billing Period Toggle */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Space>
              <Text strong>Billing Period:</Text>
              <Button
                type={
                  selectedBillingPeriod === "monthly" ? "primary" : "default"
                }
                onClick={() => setSelectedBillingPeriod("monthly")}
              >
                Monthly
              </Button>
              <Button
                type={
                  selectedBillingPeriod === "annual" ? "primary" : "default"
                }
                onClick={() => setSelectedBillingPeriod("annual")}
              >
                Annual
                <Tag color="green" style={{ marginLeft: 8 }}>
                  Save up to 17%
                </Tag>
              </Button>
            </Space>
          </Card>

          {/* Plan Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
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
                <Col xs={24} sm={12} lg={8} key={plan.identifier}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: isCurrentPlan
                        ? `2px solid ${token.colorPrimary}`
                        : `1px solid ${token.colorBorderSecondary}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    bodyStyle={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <Tag
                          color={plan.color}
                          style={{ fontSize: 14, padding: "4px 12px" }}
                        >
                          {plan.name}
                        </Tag>
                        {isCurrentPlan && (
                          <Badge status="processing" text="Current" />
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 700,
                          color: token.colorPrimary,
                          marginBottom: 8,
                        }}
                      >
                        {priceLabel}
                      </div>

                      {selectedBillingPeriod === "annual" &&
                        plan.monthly > 0 && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ${(plan.annual / 12).toFixed(2)}/month billed
                            annually
                          </Text>
                        )}

                      <div style={{ marginTop: 24, marginBottom: 24 }}>
                        {plan.features.map((feature, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <CheckCircleOutlined
                              style={{
                                color: token.colorSuccess,
                                marginRight: 8,
                              }}
                            />
                            <Text>{feature}</Text>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      type={isCurrentPlan ? "default" : "primary"}
                      block
                      size="large"
                      disabled={isCurrentPlan}
                      loading={createCheckout.isPending}
                      onClick={() =>
                        handleSubscribe(plan.identifier, selectedBillingPeriod)
                      }
                      style={{ marginTop: "auto" }}
                    >
                      {isCurrentPlan ? "Current Plan" : "Subscribe"}
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Customer Portal & Cancel Subscription */}
          {subscription?.plan !== "free" && (
            <Card
              title={
                <span style={{ fontWeight: 600, fontSize: 18 }}>
                  Manage Subscription
                </span>
              }
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="secondary">
                  Manage your subscription, payment methods, and billing history
                  through the Stripe customer portal.
                </Text>
                <Space>
                  <Button
                    type="default"
                    icon={<CreditCardOutlined />}
                    loading={customerPortal.isPending}
                    onClick={handleCustomerPortal}
                  >
                    Manage Subscription
                  </Button>
                  <Button
                    danger
                    loading={cancelSubscription.isPending}
                    onClick={async () => {
                      try {
                        await cancelSubscription.mutateAsync();
                        message.success("Subscription canceled successfully");
                        refetch();
                      } catch (error: any) {
                        message.error(
                          error?.message ||
                            "Failed to cancel subscription. Please try again."
                        );
                      }
                    }}
                  >
                    Cancel Subscription
                  </Button>
                </Space>
              </Space>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

