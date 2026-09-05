import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "../../drizzle/schema/index";
import { generateOtp } from "./otp";

// Auth.js v5 with the Drizzle adapter, per docs/00_ScopeDocument.md
// Sections 2 and 12. Session strategy is "jwt" (required for the
// Credentials provider — Auth.js does not persist Credentials sessions
// to the adapter's sessions table), but role/emailVerified/2FA state is
// carried in the JWT so every session object exposes that data without
// an extra DB round trip on every request. The adapter is still wired
// up so account linking / future OAuth providers work against the same
// schema without a follow-up migration.
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Author/Admin require email-OTP 2FA on every login per
        // docs/00_ScopeDocument.md Section 2 and Flow C — fire the code
        // now so it's already in the user's inbox by the time they reach
        // /verify-otp. Readers skip this entirely (see the jwt callback
        // below, which marks them twoFactorVerified immediately).
        if (user.role === "author" || user.role === "admin") {
          try {
            await generateOtp(user.id);
          } catch {
            // Don't block sign-in over a transient email-provider
            // failure — the /verify-otp page offers its own resend
            // action (rate-limited to once per 60s) so the user isn't
            // stuck if this first send fails.
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified ?? null;
        token.status = user.status;
        // Readers never need 2FA — treat them as already verified so
        // permission checks can gate uniformly on this one flag rather
        // than special-casing role everywhere. Author/Admin start false
        // and must complete /verify-otp (Step 2.4) to flip it.
        token.twoFactorVerified = user.role === "reader";
      }
      // Allows a server-side session.update() call (used by the OTP
      // step in Step 2.4) to flip twoFactorVerified without re-issuing
      // credentials.
      if (trigger === "update" && session?.twoFactorVerified) {
        token.twoFactorVerified = true;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "reader" | "author" | "admin";
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.status = token.status as "active" | "suspended";
        session.user.twoFactorVerified = token.twoFactorVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.AUTH_SECRET,
});
