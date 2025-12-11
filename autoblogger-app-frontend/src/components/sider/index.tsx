"use client";

import {
  CreditCardOutlined,
  DashboardOutlined,
  KeyOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useLogout } from "@refinedev/core";
import { Button, Layout, Menu, theme, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const { Sider: AntdSider } = Layout;
const { Text } = Typography;

export const CustomSider: React.FC = () => {
  const { mutate: logout } = useLogout();
  const { token } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/billing",
      icon: <CreditCardOutlined />,
      label: "Billing",
    },
    {
      key: "/licenses",
      icon: <KeyOutlined />,
      label: "Licenses",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <AntdSider
      width={260}
      style={{
        backgroundColor: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          padding: "24px 20px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Text
          strong
          style={{
            fontSize: 20,
            color: token.colorPrimary,
            fontWeight: 700,
          }}
        >
          SEO CopyWriter
        </Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname || "/dashboard"]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          flex: 1,
          borderRight: 0,
          padding: "8px",
          backgroundColor: "transparent",
        }}
        theme="light"
      />
      <div
        style={{
          padding: "16px",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={() => logout()}
          block
          size="large"
          style={{
            height: 40,
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          Logout
        </Button>
      </div>
    </AntdSider>
  );
};
