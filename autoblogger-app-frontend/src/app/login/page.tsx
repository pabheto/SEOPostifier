"use client";

import { useLogin } from "@refinedev/core";
import Link from "next/link";
import { useState } from "react";

import { ThemedTitle } from "@refinedev/antd";
import { Button, Form, Input, Layout, Space, Typography } from "antd";

export default function Login() {
  const { mutate: login } = useLogin();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: { email: string; password: string }) => {
    setLoading(true);
    login(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <Layout
      style={{
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Space direction="vertical" align="center" size="large">
        <ThemedTitle
          collapsed={false}
          wrapperStyles={{
            fontSize: "22px",
            marginBottom: "36px",
          }}
        />
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          style={{ width: "300px" }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ width: "100%" }}
            >
              Sign in
            </Button>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
            <Typography.Text type="secondary">
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#1890ff" }}>
                Sign up
              </Link>
            </Typography.Text>
          </Form.Item>
        </Form>
      </Space>
    </Layout>
  );
}
