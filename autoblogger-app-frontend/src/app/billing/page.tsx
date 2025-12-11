"use client";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useSubscription } from "@queries/subscriptions";
import {
  Badge,
  Card,
  Col,
  Row,
  Skeleton,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";

const { Title, Text } = Typography;

export default function BillingPage() {
  const { token } = theme.useToken();
  const { data, isLoading, error } = useSubscription();

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
    { monthly: number; annual: number; name: string; color: string }
  > = {
    free: { monthly: 0, annual: 0, name: "Free", color: "default" },
    basic: { monthly: 10, annual: 99, name: "Basic", color: "blue" },
    premium: { monthly: 20, annual: 199, name: "Premium", color: "purple" },
    agency: { monthly: 50, annual: 499, name: "Agency", color: "gold" },
  };

  const currentPlan =
    planPricing[subscription?.plan || "free"] || planPricing.free;

  const columns = [
    {
      title: "Plan",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag color={record.color}>{name}</Tag>
          {record.name === currentPlan.name && (
            <Badge status="processing" text="Current" />
          )}
        </div>
      ),
    },
    {
      title: "Monthly Price",
      dataIndex: "monthly",
      key: "monthly",
      render: (price: number) => (
        <Text strong style={{ fontSize: 16 }}>
          {price > 0 ? `$${price}/month` : "Free"}
        </Text>
      ),
    },
    {
      title: "Annual Price",
      dataIndex: "annual",
      key: "annual",
      render: (price: number) => (
        <Text strong style={{ fontSize: 16 }}>
          {price > 0 ? `$${price}/year` : "Free"}
        </Text>
      ),
    },
  ];

  const plansData = Object.values(planPricing).map((plan) => ({
    key: plan.name.toLowerCase(),
    ...plan,
  }));

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

          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                Available Plans
              </span>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Table
              columns={columns}
              dataSource={plansData}
              pagination={false}
              size="large"
              style={{ marginTop: 16 }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
