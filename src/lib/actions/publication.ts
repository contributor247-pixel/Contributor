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
import { resend } from "@/lib/resend";
import { PublicationInviteEmail } from "@/emails/publication-invite";

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

  const [publication] = await db
    .insert(publications)
    .values({
      name: data.name,
      slug,
      description: data.description ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      ownerId: session.user.id,
    })
    .returning();

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

export type ContributorCandidate = { id: string; name: string | null; email: string };

export async function searchContributorCandidatesAction(query: string): Promise<ContributorCandidate[]> {
  const session = await requireVerifiedAuthor();
  if (!query.trim()) return [];

  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
    .from(users)
    .where(inArray(users.role, ["author", "admin"]))
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
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Contributor <onboarding@resend.dev>",
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
