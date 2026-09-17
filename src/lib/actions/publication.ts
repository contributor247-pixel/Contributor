"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { render } from "@react-email/components";
import { db } from "@/lib/db";
import {
  publications,
  invites,
  notifications,
  users,
  articles,
} from "../../../drizzle/schema/index";
import { requireVerifiedAuthor, requireAuthorPro, ForbiddenError } from "@/lib/permissions";
import { publicationSchema, type PublicationInput } from "@/lib/validators/publication";
import { slugify } from "@/lib/slugify";
import { mailer } from "@/lib/mailer";
import { PublicationInviteEmail } from "@/emails/publication-invite";
import { InviteResponseNoticeEmail } from "@/emails/invite-response-notice";

export type PublicationActionResult =
  | { success: true; publicationId: string; slug: string }
  | { success: false; error: string };

async function generateUniquePublicationSlug(name: string): Promise<string> {
  const base = slugify(name) || "publication";
  let candidate = base;
  let suffix = 1;
  for (;;) {
    const [existing] = await db
      .select({ id: publications.id })
      .from(publications)
      .where(eq(publications.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

// Creating a Publication requires an active AuthorPro subscription at
// creation time, per docs/00_ScopeDocument.md Section 7.2 — checked
// fresh server-side, never trusting that the page even rendered the
// "New Publication" form for an eligible user (a stale client or a
// direct call must be rejected too).
export async function createPublicationAction(input: PublicationInput): Promise<PublicationActionResult> {
  const session = await requireAuthorPro();
  const parsed = publicationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const slug = await generateUniquePublicationSlug(data.name);

  let publication;
  try {
    [publication] = await db
      .insert(publications)
      .values({
        name: data.name,
        slug,
        description: data.description ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        ownerId: session.user.id,
      })
      .returning();
  } catch {
    // Most likely a slug collision from a near-simultaneous duplicate
    // submission — generateUniquePublicationSlug's read-then-insert
    // isn't transactional. Surfacing this distinctly instead of
    // letting it throw uncaught matters because PublicationForm's
    // catch-all message blames "a large cover image", which would be
    // actively misleading here.
    return { success: false, error: "Couldn't save — a very similar publication name was just created. Please try again." };
  }

  return { success: true, publicationId: publication.id, slug: publication.slug };
}

export type OwnedOrContributedPublication = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  role: "owner" | "contributor";
};

export async function getMyPublicationsAction(): Promise<OwnedOrContributedPublication[]> {
  const session = await requireVerifiedAuthor();

  const owned = await db
    .select()
    .from(publications)
    .where(eq(publications.ownerId, session.user.id));

  const acceptedInvites = await db
    .select({ publicationId: invites.publicationId })
    .from(invites)
    .where(and(eq(invites.invitedUserId, session.user.id), eq(invites.status, "accepted")));

  const contributedIds = acceptedInvites.map((i) => i.publicationId);
  const contributed =
    contributedIds.length > 0
      ? await db.select().from(publications).where(inArray(publications.id, contributedIds))
      : [];

  return [
    ...owned.map((p) => ({ ...p, role: "owner" as const })),
    ...contributed.map((p) => ({ ...p, role: "contributor" as const })),
  ];
}

export type PublicationDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  ownerId: string;
  isOwner: boolean;
};

export async function getPublicationForManagementAction(publicationId: string): Promise<PublicationDetail | null> {
  const session = await requireVerifiedAuthor();
  const [publication] = await db.select().from(publications).where(eq(publications.id, publicationId)).limit(1);
  if (!publication) return null;
  if (publication.ownerId !== session.user.id) {
    throw new ForbiddenError("You do not own this Publication");
  }
  return { ...publication, isOwner: true };
}

export type PublicationContributor = {
  inviteId: string;
  userId: string;
  name: string | null;
  email: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  respondedAt: Date | null;
};

// The Contributors tab previously only offered a search-to-invite box
// with no way to see who had already been invited, who accepted or
// declined, or who's currently an active contributor — an Owner had
// zero visibility into their own Publication's contributor state.
// Ownership-gated the same way getPublicationForManagementAction is.
export async function getPublicationContributorsAction(publicationId: string): Promise<PublicationContributor[]> {
  const session = await requireVerifiedAuthor();
  const [publication] = await db.select({ ownerId: publications.ownerId }).from(publications).where(eq(publications.id, publicationId)).limit(1);
  if (!publication) return [];
  if (publication.ownerId !== session.user.id) {
    throw new ForbiddenError("You do not own this Publication");
  }
  const rows = await db
    .select({
      inviteId: invites.id,
      userId: invites.invitedUserId,
      name: users.name,
      email: users.email,
      status: invites.status,
      createdAt: invites.createdAt,
      respondedAt: invites.respondedAt,
    })
    .from(invites)
    .innerJoin(users, eq(invites.invitedUserId, users.id))
    .where(eq(invites.publicationId, publicationId))
    .orderBy(desc(invites.createdAt));
  return rows;
}

export type ContributorCandidate = { id: string; name: string | null; email: string };

export async function searchContributorCandidatesAction(query: string): Promise<ContributorCandidate[]> {
  const session = await requireVerifiedAuthor();
  if (!query.trim()) return [];

  // Only role "author" — Admin is excluded from being invited as a
  // Publication contributor (docs/00_ScopeDocument.md Section 3, and
  // consistent with requireVerifiedAuthor() now requiring role
  // "author" for respondToInviteAction: an admin surfaced here could
  // be invited but could never accept, a dead-end invite.
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.role, "author"))
    .limit(50);

  const needle = query.trim().toLowerCase();
  return rows
    .filter((u) => u.status === "active")
    .filter((u) => u.id !== session.user.id)
    .filter((u) => (u.name ?? "").toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle))
    .slice(0, 10)
    .map(({ id, name, email }) => ({ id, name, email }));
}

export type InviteActionResult = { success: true } | { success: false; error: string };

export async function sendInviteAction(publicationId: string, invitedUserId: string): Promise<InviteActionResult> {
  const session = await requireVerifiedAuthor();

  // Publication ownership alone isn't enough here — Section 3's lapse
  // rule ("Owner cannot create new Premium content or new Publications
  // while lapsed") extends to inviting new contributors too: without
  // this, an Owner whose AuthorPro subscription has since expired could
  // keep growing a Publication indefinitely. Re-checked live per call,
  // same as createPublicationAction and resolvePremiumFields, rather
  // than trusting that owning the row still implies an active plan.
  try {
    await requireAuthorPro();
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: "Your AuthorPro subscription has lapsed — renew it to invite new contributors." };
    }
    throw err;
  }

  const [publication] = await db.select().from(publications).where(eq(publications.id, publicationId)).limit(1);
  if (!publication || publication.ownerId !== session.user.id) {
    return { success: false, error: "You do not own this Publication" };
  }
  if (invitedUserId === session.user.id) {
    return { success: false, error: "You cannot invite yourself" };
  }

  const [existingPending] = await db
    .select({ id: invites.id })
    .from(invites)
    .where(
      and(
        eq(invites.publicationId, publicationId),
        eq(invites.invitedUserId, invitedUserId),
        eq(invites.status, "pending")
      )
    )
    .limit(1);
  if (existingPending) {
    return { success: false, error: "This Author already has a pending invite to this Publication" };
  }

  const [invitedUser] = await db.select().from(users).where(eq(users.id, invitedUserId)).limit(1);
  if (!invitedUser) {
    return { success: false, error: "Author not found" };
  }

  await db.insert(invites).values({
    publicationId,
    invitedUserId,
    invitedByUserId: session.user.id,
    status: "pending",
  });

  const invitesUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/dashboard/author/invites`;
  await db.insert(notifications).values({
    userId: invitedUserId,
    type: "publication_invite",
    message: `${session.user.name ?? "An author"} invited you to contribute to ${publication.name}.`,
    linkUrl: "/dashboard/author/invites",
  });

  try {
    const html = await render(
      PublicationInviteEmail({
        inviteeName: invitedUser.name ?? "",
        publicationName: publication.name,
        inviterName: session.user.name ?? "A Contributor author",
        invitesUrl,
      })
    );
    const { error } = await mailer.emails.send({
      from: process.env.EMAIL_FROM ?? "Contributor <onboarding@contributor.app>",
      to: invitedUser.email,
      subject: `You've been invited to contribute to ${publication.name}`,
      html,
    });
    if (error) {
      // The invite/notification are already written above — an email
      // delivery failure (e.g. Resend placeholder key, per Step 2.3's
      // standing waiver) must not roll those back or report the whole
      // action as failed; the in-app notification is the reliable path.
      console.error("Failed to send publication invite email:", error.message);
    }
  } catch (err) {
    console.error("Failed to send publication invite email:", err);
  }

  return { success: true };
}

export type PendingInvite = {
  id: string;
  publicationId: string;
  publicationName: string;
  publicationDescription: string | null;
  ownerName: string | null;
  createdAt: Date;
};

export async function getMyPendingInvitesAction(): Promise<PendingInvite[]> {
  const session = await requireVerifiedAuthor();
  const rows = await db
    .select({
      id: invites.id,
      publicationId: invites.publicationId,
      publicationName: publications.name,
      publicationDescription: publications.description,
      ownerName: users.name,
      createdAt: invites.createdAt,
    })
    .from(invites)
    .innerJoin(publications, eq(invites.publicationId, publications.id))
    .innerJoin(users, eq(publications.ownerId, users.id))
    .where(and(eq(invites.invitedUserId, session.user.id), eq(invites.status, "pending")))
    .orderBy(desc(invites.createdAt));
  return rows;
}

export async function respondToInviteAction(
  inviteId: string,
  response: "accepted" | "declined"
): Promise<InviteActionResult> {
  const session = await requireVerifiedAuthor();

  const [invite] = await db.select().from(invites).where(eq(invites.id, inviteId)).limit(1);
  if (!invite || invite.invitedUserId !== session.user.id) {
    return { success: false, error: "Invite not found" };
  }
  if (invite.status !== "pending") {
    return { success: false, error: "This invite has already been responded to" };
  }

  await db.update(invites).set({ status: response, respondedAt: new Date() }).where(eq(invites.id, inviteId));

  const [publication] = await db.select().from(publications).where(eq(publications.id, invite.publicationId)).limit(1);
  if (publication) {
    await db.insert(notifications).values({
      userId: publication.ownerId,
      type: response === "accepted" ? "invite_accepted" : "invite_declined",
      message: `${session.user.name ?? "An author"} ${response} your invite to contribute to ${publication.name}.`,
      linkUrl: `/dashboard/author/publications/${publication.id}`,
    });

    const [owner] = await db.select().from(users).where(eq(users.id, publication.ownerId)).limit(1);
    if (owner) {
      const publicationUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/dashboard/author/publications/${publication.id}`;
      try {
        const html = await render(
          InviteResponseNoticeEmail({
            ownerName: owner.name ?? "",
            authorName: session.user.name ?? "An author",
            publicationName: publication.name,
            response,
            publicationUrl,
          })
        );
        const { error } = await mailer.emails.send({
          from: process.env.EMAIL_FROM ?? "Contributor <onboarding@contributor.app>",
          to: owner.email,
          subject: `${session.user.name ?? "An author"} ${response} your invite to ${publication.name}`,
          html,
        });
        if (error) {
          console.error("Failed to send invite response email:", error.message);
        }
      } catch (err) {
        console.error("Failed to send invite response email:", err);
      }
    }
  }

  return { success: true };
}

export type PublicationArticleRow = {
  id: string;
  title: string;
  status: "draft" | "published" | "unpublished";
  createdAt: Date;
};

export async function getPublicationArticlesAction(publicationId: string): Promise<PublicationArticleRow[]> {
  const session = await requireVerifiedAuthor();
  const [publication] = await db.select().from(publications).where(eq(publications.id, publicationId)).limit(1);
  if (!publication || publication.ownerId !== session.user.id) {
    throw new ForbiddenError("You do not own this Publication");
  }
  return db
    .select({ id: articles.id, title: articles.title, status: articles.status, createdAt: articles.createdAt })
    .from(articles)
    .where(eq(articles.publicationId, publicationId))
    .orderBy(desc(articles.createdAt));
}

export type SelectablePublication = { id: string; name: string };

// Publications the current Author may select in the article editor's
// Publication dropdown: ones they own, or ones they hold an accepted
// invite for. Per docs/04_MasterBuildGuide.md Step 9 point 6 — this is
// deliberately NOT the same list as co-authors from Step 4.
export async function getSelectablePublicationsAction(): Promise<SelectablePublication[]> {
  const session = await requireVerifiedAuthor();

  const owned = await db
    .select({ id: publications.id, name: publications.name })
    .from(publications)
    .where(eq(publications.ownerId, session.user.id));

  const acceptedInvites = await db
    .select({ publicationId: invites.publicationId })
    .from(invites)
    .where(and(eq(invites.invitedUserId, session.user.id), eq(invites.status, "accepted")));

  const contributedIds = acceptedInvites.map((i) => i.publicationId);
  const contributed =
    contributedIds.length > 0
      ? await db
          .select({ id: publications.id, name: publications.name })
          .from(publications)
          .where(inArray(publications.id, contributedIds))
      : [];

  const map = new Map<string, SelectablePublication>();
  for (const p of [...owned, ...contributed]) map.set(p.id, p);
  return [...map.values()];
}
