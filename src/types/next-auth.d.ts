import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "reader" | "author" | "admin";
    emailVerified: Date | null;
    status: "active" | "suspended";
  }

  interface Session {
    user: {
      id: string;
      role: "reader" | "author" | "admin";
      emailVerified: Date | null;
      status: "active" | "suspended";
      twoFactorVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "reader" | "author" | "admin";
    emailVerified: Date | null;
    status: "active" | "suspended";
    twoFactorVerified: boolean;
  }
}
