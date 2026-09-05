import type { Session } from "next-auth";
import { and, eq, gt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "../../drizzle/schema/index";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Requires any authenticated session. Throws UnauthenticatedError if
 * there is none — callers (pages, Server Actions, Route Handlers) are
 * responsible for turning that into the right response for their
 * context (redirect for a page, 401 JSON for an API route).
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthenticatedError();
  }
  return session;
}

/**
 * Requires the current user to hold one of the given roles. Always
 * calls requireAuth() first, so an unauthenticated caller gets
 * UnauthenticatedError rather than ForbiddenError.
 *
 * When "admin" is one of the allowed roles, this also requires
 * twoFactorVerified: Admin accounts go through the same email-OTP
 * flow as Authors on every login (src/lib/auth.ts), and admin actions
 * (user suspension, fee config, moderation) are sensitive enough that
 * a pre-OTP admin session must not be treated as fully authorized —
 * confirmed with the user, since docs/04_MasterBuildGuide.md's Step
 * 2.6 text states the OTP requirement explicitly for author routes
 * but not admin routes, which reads as an omission rather than an
 * intentional exemption given admin shares the same login flow.
 */
export async function requireRole(
  role: "reader" | "author" | "admin" | Array<"reader" | "author" | "admin">
): Promise<Session> {
  const session = await requireAuth();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.user.role)) {
    throw new ForbiddenError(`Requires role: ${allowed.join(" or ")}`);
  }
  if (allowed.includes("admin") && session.user.role === "admin" && !session.user.twoFactorVerified) {
    throw new ForbiddenError("Two-factor verification not completed");
  }
  return session;
}

/**
 * Requires an ACTIVE, non-expired author_pro subscription row for the
 * current user — queried fresh from the DB every call, per
 * docs/04_MasterBuildGuide.md Step 2.6, rather than trusting any cached
 * role/flag on the session. A lapsed or cancelled AuthorPro subscriber
 * fails this check even though their role is still "author"/"admin",
 * per docs/00_ScopeDocument.md Section 3's confirmed lapse behavior
 * (existing content stays live, but new Premium/Publications require
 * an active subscription at the time of the action).
 */
export async function requireAuthorPro(): Promise<Session> {
  const session = await requireAuth();

  const [activeSub] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, session.user.id),
        eq(subscriptions.type, "author_pro"),
        eq(subscriptions.status, "active"),
        gt(subscriptions.currentPeriodEnd, new Date())
      )
    )
    .limit(1);

  if (!activeSub) {
    throw new ForbiddenError("Requires an active AuthorPro subscription");
  }
  return session;
}

/**
 * Requires role author/admin, a verified email, and completed OTP 2FA
 * for the current session — the full "fully-verified Author" bar per
 * docs/01_ApplicationFlow.md Flow C, used to gate /dashboard/author.
 */
export async function requireVerifiedAuthor(): Promise<Session> {
  const session = await requireRole(["author", "admin"]);
  if (!session.user.emailVerified) {
    throw new ForbiddenError("Email not verified");
  }
  if (!session.user.twoFactorVerified) {
    throw new ForbiddenError("Two-factor verification not completed");
  }
  return session;
}
