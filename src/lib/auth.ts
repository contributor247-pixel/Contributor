import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens, autoLoginTokens } from "../../drizzle/schema/index";
import { generateOtp } from "./otp";

// Session length is a single fixed value for everyone. docs/04_Master
// BuildGuide.md's Step 2.5 asks for "Remember Me" to extend session
// length, but Auth.js v5's session.maxAge/cookie expiry is a single
// static config value used for every session's displayed `expires` and
// actual cookie lifetime (see @auth/core/lib/actions/session.js) — it
// cannot vary per sign-in through the normal config surface. A custom
// jwt.encode() with a shorter internal token `exp` was tried and
// rejected: the cookie and the session's displayed expiry would still
// both claim the full 30 days regardless of the checkbox, while the
// token quietly stopped decrypting early — a confusing, half-working
// result. The "Remember Me" checkbox stays in the UI (matches the
// design reference) but does not currently change session length;
// everyone gets the one maxAge below.
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Distinct error codes so the client can show the right inline message
// per docs/04_MasterBuildGuide.md Step 2.5, instead of a single generic
// "invalid credentials" for every failure mode.
class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid-credentials";
}
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
}
class AccountSuspendedError extends CredentialsSignin {
  code = "account-suspended";
}

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
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // Optional — set only by the internal auto-login exchange right
        // after clicking an email verification link (see
        // completeAutoLoginAction in verify-email.ts). Never rendered as
        // a real form field. When present, it's checked in place of a
        // password so docs/01_ApplicationFlow.md Flow A step 6's
        // "auto-logged in" can actually establish a session — Auth.js's
        // Credentials provider has no password-less path otherwise, and
        // the plaintext password isn't available at verification time
        // (only its hash is stored).
        autoLoginToken: { label: "Auto-login token", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const autoLoginToken = credentials?.autoLoginToken as string | undefined;
        if (!email) throw new InvalidCredentialsError();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) throw new InvalidCredentialsError();

        if (autoLoginToken) {
          // Single-use by construction: delete-then-check, so a replayed
          // or guessed token can never succeed twice, and a concurrent
          // duplicate request can't both pass.
          const [tokenRow] = await db
            .delete(autoLoginTokens)
            .where(and(eq(autoLoginTokens.token, autoLoginToken), eq(autoLoginTokens.userId, user.id)))
            .returning();
          if (!tokenRow || tokenRow.expires < new Date()) {
            throw new InvalidCredentialsError();
          }
        } else {
          if (!password || !user.passwordHash) throw new InvalidCredentialsError();
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) throw new InvalidCredentialsError();
        }

        // Suspended accounts are blocked outright, per
        // docs/00_ScopeDocument.md's Admin capabilities — checked before
        // email verification since being suspended is the more severe,
        // and more final, reason sign-in is refused.
        if (user.status === "suspended") {
          throw new AccountSuspendedError();
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        // Author/Admin require email-OTP 2FA on every login per
        // docs/00_ScopeDocument.md Section 2 and Flow C — fire the code
        // now so it's already in the user's inbox by the time they reach
        // /verify-otp. Readers skip this entirely (see the jwt callback
        // below, which marks them twoFactorVerified immediately). This
        // still applies on the auto-login path — verifying an email
        // doesn't substitute for 2FA.
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
      if (user?.id) {
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
