"use client";

import "@ant-design/v5-patch-for-react-19";
import { useNotificationProvider } from "@refinedev/antd";
import { Refine, type AuthProvider } from "@refinedev/core";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";

import routerProvider from "@refinedev/nextjs-router";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ColorModeContextProvider } from "@contexts/color-mode";
import { dataProvider, liveProvider } from "@providers/data-provider";
import "@refinedev/antd/dist/reset.css";
import { App } from "antd";

type RefineContextProps = {
  defaultMode?: string;
};

export const RefineContext = (
  props: React.PropsWithChildren<RefineContextProps>
) => {
  return (
    <SessionProvider>
      <App {...props} />
    </SessionProvider>
  );
};

type AppProps = {
  defaultMode?: string;
};

const App = (props: React.PropsWithChildren<AppProps>) => {
  const { data, status } = useSession();
  const to = usePathname();

  if (status === "loading") {
    return <span>loading...</span>;
  }

  const authProvider: AuthProvider = {
    login: async (params) => {
      signIn("credentials", {
        email: params?.email,
        password: params?.password,
        callbackUrl: to ? to.toString() : "/",
        redirect: true,
      });

      return {
        success: true,
      };
    },
    logout: async () => {
      signOut({
        redirect: true,
        callbackUrl: "/login",
      });

      return {
        success: true,
      };
    },
    onError: async (error) => {
      if (error.response?.status === 401) {
        return {
          logout: true,
        };
      }

      return {
        error,
      };
    },
    check: async () => {
      if (status === "unauthenticated") {
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

      return {
        authenticated: true,
      };
    },
    getPermissions: async () => {
      return null;
    },
    getIdentity: async () => {
      if (data?.user) {
        const { user } = data;
        return {
          name: user.name,
          avatar: user.image,
        };
      }

      return null;
    },
  };

  const defaultMode = props?.defaultMode;

  return (
    <AntdRegistry>
      <ColorModeContextProvider defaultMode={defaultMode}>
        <App>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider}
            liveProvider={liveProvider}
            notificationProvider={useNotificationProvider}
            authProvider={authProvider}
            resources={[
              {
                name: "dashboard",
                list: "/dashboard",
                meta: {
                  label: "Dashboard",
                },
              },
              {
                name: "billing",
                list: "/billing",
                meta: {
                  label: "Billing",
                },
              },
              {
                name: "licenses",
                list: "/licenses",
                meta: {
                  label: "Licenses",
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              liveMode: "auto",
            }}
          >
            {props.children}
          </Refine>
        </App>
      </ColorModeContextProvider>
    </AntdRegistry>
  );
};
