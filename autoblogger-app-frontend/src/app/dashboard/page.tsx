"use client";

import {
  CalendarOutlined,
  FileTextOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useSubscription } from "@queries/subscriptions";
import {
  Card,
  Col,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Typography,
  theme,
} from "antd";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { token } = theme.useToken();
  const { data, isLoading, error } = useSubscription();

  if (error) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <Text type="danger">Error loading dashboard data</Text>
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
      free: "default",
      basic: "blue",
      premium: "purple",
      agency: "gold",
    };
    return colors[plan] || "default";
  };

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
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Overview of your subscription and usage
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
                }}
              >
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Current Plan
                    </Text>
                  }
                  value={subscription?.plan?.toUpperCase() || "FREE"}
                  valueStyle={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: token.colorPrimary,
                  }}
                  prefix={
                    <Tag
                      color={getPlanColor(subscription?.plan || "free")}
                      style={{ marginRight: 8 }}
                    >
                      {subscription?.plan || "FREE"}
                    </Tag>
                  }
                />
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
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Billing Period Start
                    </Text>
                  }
                  value={
                    billingPeriod?.start
                      ? new Date(billingPeriod.start).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : "-"
                  }
                  valueStyle={{
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                />
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
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Billing Period End
                    </Text>
                  }
                  value={
                    billingPeriod?.end
                      ? new Date(billingPeriod.end).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : "-"
                  }
                  valueStyle={{
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
                title={
                  <div>
                    <PictureOutlined
                      style={{ marginRight: 8, color: token.colorPrimary }}
                    />
                    <span style={{ fontWeight: 600 }}>AI Generated Images</span>
                  </div>
                }
              >
                <Statistic
                  value={usage?.aiGeneratedImages || 0}
                  suffix={`/ ${limits.images}`}
                  valueStyle={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: token.colorPrimary,
                  }}
                />
                <Progress
                  percent={imagesUsagePercent}
                  strokeColor={{
                    "0%": token.colorPrimary,
                    "100%": token.colorSuccess,
                  }}
                  status={
                    imagesUsagePercent >= 90
                      ? "exception"
                      : imagesUsagePercent >= 75
                      ? "active"
                      : "success"
                  }
                  style={{ marginTop: 24 }}
                  size={8}
                />
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                  {limits.images - (usage?.aiGeneratedImages || 0)} images
                  remaining
                </Text>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
                title={
                  <div>
                    <FileTextOutlined
                      style={{ marginRight: 8, color: token.colorPrimary }}
                    />
                    <span style={{ fontWeight: 600 }}>Generated Words</span>
                  </div>
                }
              >
                <Statistic
                  value={usage?.generatedWords || 0}
                  suffix={`/ ${limits.words.toLocaleString()}`}
                  valueStyle={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: token.colorPrimary,
                  }}
                />
                <Progress
                  percent={wordsUsagePercent}
                  strokeColor={{
                    "0%": token.colorPrimary,
                    "100%": token.colorSuccess,
                  }}
                  status={
                    wordsUsagePercent >= 90
                      ? "exception"
                      : wordsUsagePercent >= 75
                      ? "active"
                      : "success"
                  }
                  style={{ marginTop: 24 }}
                  size={8}
                />
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                  {(
                    limits.words - (usage?.generatedWords || 0)
                  ).toLocaleString()}{" "}
                  words remaining
                </Text>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
