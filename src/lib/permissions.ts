import type { Session } from "next-auth";
import { and, eq, gt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions, purchases } from "../../drizzle/schema/index";

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

/**
 * Whether the given user (or an anonymous visitor, if userId is null)
 * has qualifying access to a Premium article: a purchase record, an
 * active subscription to the article's Publication, or an active
 * platform-wide subscription. Any one suffices per
 * docs/00_ScopeDocument.md Section 6's access rule. Free articles
 * always return true without a DB round-trip. This is a plain boolean
 * check, not a require*() throw-on-failure guard, since the single
 * article page needs to render a paywall rather than redirect/404 for
 * a Premium article the viewer doesn't yet have access to.
 */
export type ArticleAccessResult =
  | { granted: true; source: "free" }
  | { granted: true; source: "purchase" }
  | { granted: true; source: "platform_subscription"; billingPeriodStart: Date }
  | { granted: true; source: "publication_subscription"; billingPeriodStart: Date }
  | { granted: false };

/**
 * Resolves how (if at all) the given user has qualifying access to a
 * Premium article: a purchase record, an active platform-wide
 * subscription, or an active subscription to the article's
 * Publication. Any one suffices per docs/00_ScopeDocument.md Section
 * 6's access rule. Free articles always grant access without a DB
 * round-trip. Returns which source granted access (plus the
 * subscription's currentPeriodStart, needed to bucket a qualifying
 * read event for Step 10's pooled-revenue distribution) rather than a
 * plain boolean, since a purchase and a subscription are handled very
 * differently downstream — a purchase is already fully attributed at
 * purchase time, while a subscription-based view must log a read
 * event for later pooled distribution.
 */
export async function getArticleAccessSource(
  userId: string | null,
  article: { isPremium: boolean; id: string; publicationId: string | null }
): Promise<ArticleAccessResult> {
  if (!article.isPremium) return { granted: true, source: "free" };
  if (!userId) return { granted: false };

  const [purchase] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.articleId, article.id)))
    .limit(1);
  if (purchase) return { granted: true, source: "purchase" };

  const [platformSub] = await db
    .select({ currentPeriodStart: subscriptions.currentPeriodStart })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.type, "platform"),
        eq(subscriptions.status, "active"),
        gt(subscriptions.currentPeriodEnd, new Date())
      )
    )
    .limit(1);
  if (platformSub) return { granted: true, source: "platform_subscription", billingPeriodStart: platformSub.currentPeriodStart };

  if (article.publicationId) {
    const [pubSub] = await db
      .select({ currentPeriodStart: subscriptions.currentPeriodStart })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.type, "publication"),
          eq(subscriptions.publicationId, article.publicationId),
          eq(subscriptions.status, "active"),
          gt(subscriptions.currentPeriodEnd, new Date())
        )
      )
      .limit(1);
    if (pubSub) return { granted: true, source: "publication_subscription", billingPeriodStart: pubSub.currentPeriodStart };
  }

  return { granted: false };
}

/** Plain boolean convenience wrapper around getArticleAccessSource(). */
export async function hasArticleAccess(
  userId: string | null,
  article: { isPremium: boolean; id: string; publicationId: string | null }
): Promise<boolean> {
  return (await getArticleAccessSource(userId, article)).granted;
}
