"use client";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  KeyOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useCreateLicense, useLicenses } from "@queries/licenses";
import { useSubscription } from "@queries/subscriptions";
import {
  App,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Table,
  Tag,
  theme,
  Typography,
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

export default function LicensesPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { data: licenses, isLoading, error } = useLicenses();
  const { data: subscriptionData } = useSubscription();
  const createLicense = useCreateLicense();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [licenseName, setLicenseName] = useState<string>("");

  const subscription = subscriptionData?.subscription;
  const currentPlan = subscription?.plan || "free";

  // Plan limits for maximum active licenses
  const planLimits: Record<string, number> = {
    free: 1,
    basic: 1,
    premium: 1,
    agency: 1,
  };

  const maxLicenses = planLimits[currentPlan] || 1;
  const activeLicenses = licenses?.filter((l) => l.active) || [];
  const activeCount = activeLicenses.length;
  const remainingLicenses = Math.max(0, maxLicenses - activeCount);

  const handleCreateLicense = async () => {
    if (!licenseName.trim()) {
      message.error("Please enter a license name");
      return;
    }
    try {
      await createLicense.mutateAsync({ name: licenseName.trim() });
      message.success("License created successfully!");
      setIsModalVisible(false);
      setLicenseName("");
    } catch (error: any) {
      message.error(error?.message || "Failed to create license");
    }
  };

  const handleCopyLicense = (licenseKey: string) => {
    navigator.clipboard.writeText(licenseKey);
    message.success("License key copied to clipboard!");
  };

  const columns = [
    {
      title: "License Key",
      dataIndex: "key",
      key: "key",
      render: (key: string) => (
        <Space.Compact style={{ width: "100%" }}>
          <Input
            readOnly
            value={key}
            style={{
              fontFamily: "monospace",
              backgroundColor: token.colorFillTertiary,
            }}
          />
          <Button
            icon={<CopyOutlined />}
            onClick={() => handleCopyLicense(key)}
            type="primary"
          >
            Copy
          </Button>
        </Space.Compact>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name || "Unnamed License"}</Text>,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Tag
          color={active ? "success" : "error"}
          icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        date
          ? new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "-",
    },
  ];

  if (error) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <Text type="danger">Error loading licenses</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorFillQuaternary} 100%)`,
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 32 }}
        gutter={[16, 16]}
      >
        <Col>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Licenses
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Manage your license keys
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Active licenses: <Text strong>{activeCount}</Text> / {maxLicenses}
              {remainingLicenses > 0 && (
                <Text type="success" style={{ marginLeft: 8 }}>
                  ({remainingLicenses} remaining)
                </Text>
              )}
            </Text>
          </div>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            disabled={remainingLicenses === 0}
            style={{
              borderRadius: 8,
              height: 40,
              fontWeight: 600,
            }}
          >
            Create License
          </Button>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={licenses || []}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} licenses`,
            }}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <KeyOutlined style={{ color: token.colorPrimary }} />
            <span style={{ fontWeight: 600 }}>Create New License</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleCreateLicense}
        onCancel={() => {
          setIsModalVisible(false);
          setLicenseName("");
        }}
        confirmLoading={createLicense.isPending}
        okText="Create License"
        okButtonProps={{
          style: { borderRadius: 6, fontWeight: 600 },
        }}
        cancelButtonProps={{
          style: { borderRadius: 6 },
        }}
        style={{ borderRadius: 12 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            License Name:
          </Text>
          <Input
            placeholder="Enter a name for this license"
            size="large"
            value={licenseName}
            onChange={(e) => setLicenseName(e.target.value)}
            onPressEnter={handleCreateLicense}
            maxLength={100}
          />
        </div>
        <div
          style={{
            padding: 12,
            backgroundColor: token.colorFillTertiary,
            borderRadius: 6,
            fontSize: 12,
            color: token.colorTextSecondary,
          }}
        >
          You can create <Text strong>{remainingLicenses}</Text> more{" "}
          {remainingLicenses === 1 ? "license" : "licenses"} with your current
          plan (<Text strong>{currentPlan.toUpperCase()}</Text>).
        </div>
      </Modal>
    </div>
  );
}
