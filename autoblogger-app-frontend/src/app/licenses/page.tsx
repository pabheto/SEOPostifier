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
  Button,
  Card,
  Col,
  Input,
  message,
  Modal,
  Row,
  Select,
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
  const { data: licenses, isLoading, error } = useLicenses();
  const { data: subscriptionData } = useSubscription();
  const createLicense = useCreateLicense();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("BASIC");

  const subscription = subscriptionData?.subscription;
  const currentPlan = subscription?.plan || "free";

  const planToLicenseRoles: Record<string, string[]> = {
    free: ["BASIC"],
    basic: ["BASIC"],
    premium: ["BASIC", "PREMIUM"],
    agency: ["BASIC", "PREMIUM", "ENTERPRISE"],
  };

  const availableRoles = planToLicenseRoles[currentPlan] || ["BASIC"];

  const handleCreateLicense = async () => {
    try {
      await createLicense.mutateAsync({ role: selectedRole });
      message.success("License created successfully!");
      setIsModalVisible(false);
      setSelectedRole("BASIC");
    } catch (error) {
      message.error("Failed to create license");
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
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          ENTERPRISE: "red",
          PREMIUM: "purple",
          BASIC: "blue",
        };
        return (
          <Tag color={colorMap[role] || "default"} style={{ fontSize: 12 }}>
            {role}
          </Tag>
        );
      },
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
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
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
          setSelectedRole("BASIC");
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
            Select License Role:
          </Text>
          <Select
            style={{ width: "100%" }}
            size="large"
            value={selectedRole}
            onChange={setSelectedRole}
            options={availableRoles.map((role) => ({
              label: role,
              value: role,
            }))}
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
          Based on your current plan (
          <Text strong>{currentPlan.toUpperCase()}</Text>), you can create
          licenses with the following roles:{" "}
          <Text strong>{availableRoles.join(", ")}</Text>
        </div>
      </Modal>
    </div>
  );
}
