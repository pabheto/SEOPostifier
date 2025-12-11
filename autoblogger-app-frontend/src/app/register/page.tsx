"use client";

import { useLogin } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ThemedTitle } from "@refinedev/antd";
import { Button, Form, Input, Layout, Space, Typography, message } from "antd";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function Register() {
  const { mutate: login } = useLogin();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      // Automatically log in the user after successful registration
      message.success("Registration successful! Logging you in...");

      // Use the token from registration to sign in
      login(
        {
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: () => {
            setLoading(false);
            router.push("/");
          },
          onError: (error) => {
            setLoading(false);
            message.error(
              "Registration successful, but login failed. Please try logging in manually."
            );
            console.error("Login error after registration:", error);
          },
        }
      );
    } catch (error: any) {
      setLoading(false);
      message.error(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    }
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
          name="register"
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
            rules={[
              { required: true, message: "Please input your password!" },
              {
                min: 6,
                message: "Password must be at least 6 characters!",
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ width: "100%" }}
            >
              Sign up
            </Button>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
            <Typography.Text type="secondary">
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#1890ff" }}>
                Sign in
              </Link>
            </Typography.Text>
          </Form.Item>
        </Form>
      </Space>
    </Layout>
  );
}

