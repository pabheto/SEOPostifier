"use client";

import { MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Switch,
  theme,
  Typography,
} from "antd";
import React, { useContext } from "react";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgContainer,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 32px",
    height: "72px",
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 100;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space size="large">
        <Switch
          checked={mode === "dark"}
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          style={{
            backgroundColor: mode === "dark" ? token.colorPrimary : undefined,
          }}
        />
        {(user?.name || user?.avatar) && (
          <Space size="middle" style={{ cursor: "pointer" }}>
            <Space size="small">
              {user?.name && (
                <Text strong style={{ fontSize: 14 }}>
                  {user.name}
                </Text>
              )}
              <Avatar
                src={user?.avatar}
                icon={!user?.avatar && <UserOutlined />}
                alt={user?.name}
                style={{
                  backgroundColor: token.colorPrimary,
                }}
              />
            </Space>
          </Space>
        )}
      </Space>
    </AntdLayout.Header>
  );
};
