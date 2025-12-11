"use client";

import { LogoutOutlined } from "@ant-design/icons";
import { useLogout, useMenu } from "@refinedev/core";
import { Button, Layout, Menu, theme } from "antd";
import React from "react";

const { Sider: AntdSider } = Layout;

export const CustomSider: React.FC = () => {
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();
  const { mutate: logout } = useLogout();
  const { token } = theme.useToken();

  // Transform menuItems to Ant Design Menu items format
  const transformMenuItems = (items: typeof menuItems): any[] => {
    return items.map((item) => {
      const menuItem: any = {
        key: item.key,
        label: item.label,
        icon: item.icon,
      };

      if (item.children && item.children.length > 0) {
        menuItem.children = transformMenuItems(item.children);
      }

      return menuItem;
    });
  };

  const items = transformMenuItems(menuItems);

  return (
    <AntdSider
      style={{
        backgroundColor: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorder}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={defaultOpenKeys}
        items={items}
        style={{ flex: 1, borderRight: 0 }}
      />
      <div
        style={{
          padding: "16px",
          borderTop: `1px solid ${token.colorBorder}`,
        }}
      >
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={() => logout()}
          block
        >
          Logout
        </Button>
      </div>
    </AntdSider>
  );
};
