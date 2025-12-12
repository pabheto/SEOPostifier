import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Implement your authentication logic here
        // This should call your backend API to verify credentials
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

        try {
          const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.email,
            accessToken: data.token,
            role: data.user.role || "USER",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  secret:
    process.env.NEXTAUTH_SECRET ||
    `UItTuD1HcGXIj8ZfHUswhYdNd40Lc325R8VlxQPUoR0=`,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the access token to the token right after signin
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role || "USER";
      }
      // If no user (session refresh), ensure role persists
      // If role is missing, try to fetch it from the backend
      if (!token.role && token.accessToken) {
        try {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
          const response = await fetch(`${API_BASE_URL}/users/validate`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            token.role = data.user?.role || "USER";
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken as string;
      }
      if (token.id) {
        (session as any).user.id = token.id as string;
      }
      // Always set role from token, even if it's undefined (will be 'USER' by default)
      (session as any).user.role = (token.role as string) || "USER";
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
