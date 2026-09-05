# 00 — Scope Document (Canonical Reference)

> **This is the single source of truth for what this product does.** Every other document in `/docs/` and every "Agent Task" prompt in `04_MasterBuildGuide.md` refers back to this file for rules, numbers, and permissions. If any other document appears to conflict with this one, this document wins. The coding agent must re-read this file before implementing any feature that touches roles, money, or permissions, rather than guessing or re-deriving rules from memory.

Source: derived in full from `Refrence/Article_Platform_Spec.docx (1).md` (client-provided scope spec, Phase 1). Nothing in this document contradicts that spec — it only adds the concrete technical decisions needed to build it.

---

## 1. Overview

**Contributor** is a content publishing platform (client-confirmed brand name — used consistently across all docs, code, package/repo names, and copy from here on).

> **Naming note for the coding agent:** the brand name "Contributor" and the domain term "Contributor" (someone invited to write into another user's Publication, see the Content Model below) are two different things that happen to share a word. Context always disambiguates — the brand name appears in logos/titles/package names, the domain term appears in Publication/invite-related UI and code (`invites`, `articleAuthors`, "Add Contributor" in a Publication's Contributors tab). Do not conflate them or rename the domain concept to avoid the collision.

Registered **Authors** write articles on any subject permitted under the Platform's Terms & Conditions. **Readers** consume that content. The platform has a monetisation layer:

- Authors can upgrade to **AuthorPro** to paywall ("Premium") their content and form **Publications** (multi-author collections, like a digital magazine).
- Readers can pay per article, subscribe to a single Publication, or subscribe to the whole Platform for unlimited access.
- The Platform takes a percentage cut of all Premium revenue, per the split table in Section 4.

This is Phase 1 scope. Anything under Section 10 (Out of Scope) must **not** be built unless the user explicitly asks for a Phase 2 extension later.

---

## 2. Glossary of Roles & Terms

| Term | Meaning |
|---|---|
| **Reader** | Default role for any registered user who is not an Author. Free registration. Browses and reads free content at no cost. |
| **Author** | A Reader who has registered as a content creator (free tier). Verified by email + OTP-based 2FA. Publishes free articles only. |
| **AuthorPro** | An Author who holds an active paid AuthorPro subscription (monthly or yearly). Can paywall articles and create Publications. |
| **Platform Admin** | Internal staff role. Manages users, fees, categories, and moderation. Not self-registerable — seeded/promoted manually. |
| **Article** | The core content unit. Written by one Author or jointly by multiple Authors. Free by default. |
| **Premium** | A flag on an article (AuthorPro only) marking it as paid access — via pay-per-article purchase or an applicable subscription. |
| **Category** | Fixed taxonomy, managed only by Admin. Chosen by the Author at publish time. |
| **Tag** | Free-form label created by Authors. Not Admin-controlled. |
| **Publication** | A collection of articles from multiple Authors, owned by one AuthorPro user ("Publication Owner"). Can contain free and/or Premium articles. |
| **Joint authorship** | Two or more Authors co-authoring one article. Always free — never monetised, regardless of the individual authors' Pro status. |
| **PSP** | Payment Service Provider — Stripe (see Section 8). |
| **Read event** | A logged record that a specific Reader opened a specific Premium article, used to distribute pooled Platform-subscription revenue (Section 4.2). |

---

## 3. Role & Permission Matrix

| Capability | Reader | Author (free) | AuthorPro | Platform Admin |
|---|:---:|:---:|:---:|:---:|
| Register / log in | ✅ | ✅ | ✅ | (internal only) |
| Browse & read free articles | ✅ | ✅ | ✅ | ✅ |
| Search articles | ✅ | ✅ | ✅ | ✅ |
| Purchase a Premium article (pay-per-article) | ✅ | ✅ (as a reader) | ✅ (as a reader) | ❌ |
| Subscribe to a Publication | ✅ | ✅ | ✅ | ❌ |
| Subscribe to the Platform | ✅ | ✅ | ✅ | ❌ |
| Report an article | ✅ | ✅ | ✅ | ❌ |
| Write / edit / publish an article (free) | ❌ | ✅ | ✅ | ❌ |
| Apply a Category to own article | ❌ | ✅ | ✅ | ❌ |
| Create own Tags | ❌ | ✅ | ✅ | ❌ |
| Co-author an article jointly (always free) | ❌ | ✅ | ✅ | ❌ |
| Accept/decline an invite to contribute to a Publication | ❌ | ✅ | ✅ | ❌ |
| Mark own article as Premium + set price | ❌ | ❌ | ✅ | ❌ |
| Create a Publication | ❌ | ❌ | ✅ (only AuthorPro) | ❌ |
| Invite Authors (free or Pro) to a Publication | ❌ | ❌ | ✅ (as Owner) | ❌ |
| Upgrade Author → AuthorPro (billing) | n/a | ✅ (self) | n/a | ❌ |
| View/verify/suspend user accounts | ❌ | ❌ | ❌ | ✅ |
| Configure fees (subscription prices, pay-per-article prices, revenue split %) | ❌ | ❌ | ❌ | ✅ |
| Manage Categories (create/edit/delete) | ❌ | ❌ | ❌ | ✅ |
| Review moderation queue (reported articles) | ❌ | ❌ | ❌ | ✅ |
| Action a report (dismiss / unpublish / suspend Author) | ❌ | ❌ | ❌ | ✅ |

**Rules to enforce in code, not just UI:**
- Every privileged action above must be enforced server-side (API route / server action), never trusted from client state alone.
- AuthorPro-only actions must check an active, non-expired AuthorPro subscription status at the time of the action, not just a cached role flag.
- A Publication can only be **created** by a user whose role is AuthorPro at creation time. If an AuthorPro subscription later lapses, existing Publications and existing Premium articles remain live (Phase 1 does not require auto-unpublishing on lapse — but the Owner cannot create *new* Premium content or *new* Publications while lapsed). This does not appear in the client spec; it is a **confirmed assumption** (client-approved) — do not re-litigate or re-ask.

---

## 4. Content Model

| Concept | Description |
|---|---|
| **Article** | Core content unit. Written by one Author, or jointly by multiple Authors. Free by default. Has: title, body (rich text), cover image, Category (one, required), Tags (many, free-form), Author(s), optional Publication link, Premium flag, price (if Premium and not covered by a subscription), publish status (draft/published/unpublished), created/updated timestamps, view/read-event log. |
| **Premium flag** | Optional, settable only by AuthorPro. Marks an article as paid access (pay-per-article, or via an applicable Publication/Platform subscription). |
| **Category** | Fixed taxonomy, managed by Admin only. Applied by the Author at publish time. One Category per article in Phase 1. |
| **Tag** | Free-form, created by Authors at publish time. Not Admin-controlled. Many-to-many with articles. |
| **Publication** | A collection of articles from multiple Authors, owned by one AuthorPro user. Has: name, description, cover image, Owner, list of accepted Contributors, list of Articles. Can contain free and/or Premium articles, at each contributing Author's discretion. |
| **Contributor invite** | A pending/accepted/declined relationship between a Publication and an invited Author. Must be explicitly accepted before the Author can publish into that Publication. |
| **Comment** | A short text reply left by any registered Reader or Author on an article. Not in the client's original written spec — added because the client's own visual reference (`single_art.png`) shows a comment section on the single-article page, and confirmed as in-scope for this build. See the "Comments" note below. |

**Comments (added scope, confirmed with client via the visual reference):**
- Any logged-in user (Reader, Author, AuthorPro) can post a comment on a published article. Visitors must sign up/log in to comment (reuses the existing AuthModal).
- Phase 1 scope: flat comments only — **no nested replies/threading**, no comment editing after posting, no comment-specific upvote/like system.
- A comment can be deleted by its own author, or by a Platform Admin (moderation). A comment does **not** have its own separate report/flag flow in Phase 1 — the existing "Report this article" mechanism (Section 8) covers abuse concerns at the article level; a comment-level report queue is Phase 2 if the client wants finer-grained moderation later.
- Comments are not part of the monetisation/revenue-split model in any way — they carry no paywall interaction and are visible on both free and Premium articles (Premium article comments are visible to everyone regardless of paywall status, since the comment itself isn't the paywalled content).
- Data model: `comments` table — id, articleId (fk), userId (fk), body (text), createdAt, deletedAt (nullable, soft delete so moderation history is preserved). See `03_FolderStructure.md` and `04_MasterBuildGuide.md` Step 5 for where this is implemented.

---

## 5. Monetisation & Revenue Split Rules (verbatim from spec — do not alter these numbers)

### 5.1 Revenue splits

| Scenario | Split |
|---|---|
| Premium article, **not** in a Publication | **Author 80% / Platform 20%** |
| Premium article, **inside** a Publication | **Author 60% / Publication Owner 20% / Platform 20%** |
| Free article (including jointly authored) | **No revenue share — not monetised** |

These percentages are the Phase 1 defaults and must be stored as **admin-configurable values** (Section 7), not hardcoded constants — but the *default seed values* on first setup must be exactly 80/20 and 60/20/20 as above.

### 5.2 Platform subscription pool distribution

When a Reader pays for an all-access **Platform subscription** (rather than buying per-article), that revenue must be distributed across the Premium articles they actually read during the billing period.

**Phase 1 approach (confirmed, do not re-ask):** an **even split** across the distinct Premium articles the subscriber reads in that billing period, then apply the standard revenue split from Section 5.1 to each article's share.

Example: Reader pays $10/month Platform subscription. During the period they read 5 distinct Premium articles: 3 standalone, 2 inside the same Publication. Each article gets $2 (10 ÷ 5). The 3 standalone articles each pay their Author 80% of $2 ($1.60) and Platform 20% ($0.40). The 2 Publication articles each pay their Author 60% of $2 ($1.20), Publication Owner 20% ($0.40), Platform 20% ($0.40).

**Definition of a qualifying "read" (resolved for build, do not re-ask):** an article opened and rendered past the paywall counts as one qualifying read per Reader per article per billing period (i.e., re-reading the same article twice in one period does not double-count). This is logged via a `read_events` table keyed by (reader_id, article_id, billing_period). This satisfies the spec's "Open item to confirm with development" by picking the simplest, explicitly-permitted Phase 1 interpretation (article opened vs. scroll-depth/time-on-page — Phase 1 uses "opened," time/scroll-weighting is Phase 2, see Section 10).

### 5.3 Revenue split ledger (required even though payouts are stubbed)

Every revenue event (article purchase, subscription-period distribution) must write a **ledger entry** recording: article id, payer (reader) id, gross amount, Platform's cut, Author's cut, Publication Owner's cut (if applicable), the split percentages used at the time, and a payout status (`pending` in Phase 1 — see Section 8, Stripe Connect is stubbed). This ledger is the system of record for what is owed to whom, even before actual Stripe Connect transfers are wired up.

---

## 6. Subscription Structure

| Plan | Who buys it | Grants | Billing |
|---|---|---|---|
| **AuthorPro** | Authors | Ability to paywall content, create Publications, invite contributors | Monthly or yearly, single tier |
| **Pay-per-article** | Readers | One-off access to a single Premium article | One-time payment |
| **Publication subscription** | Readers | Unlimited access to one specific Publication's Premium content | Monthly or yearly, single tier |
| **Platform subscription** | Readers | Ad-free, unlimited access to **all** Premium content platform-wide | Monthly or yearly, single tier |

**Supersede rule (verbatim from spec):** Reader subscriptions are independent of one another. If a Reader with an active Publication subscription later subscribes to the Platform, the Publication subscription is **cancelled/superseded**, since Platform access already includes it. The reverse is not automatic — subscribing to a Publication while already on a Platform subscription is allowed but redundant (the UI should warn the Reader before letting them do this, but must not block it in Phase 1).

Phase 1 keeps plan design simple: **a single tier per subscription type**. Multiple tiers are Phase 2 (Section 10).

---

## 7. Collaboration & Publications Workflow

### 7.1 Joint authorship
- Any Author (free or Pro) can co-author an article with another Author.
- Jointly authored articles are **always free** — no revenue share applies, even if one or both co-authors are AuthorPro.
- Both co-authors are listed as Authors on the article and both see it on their profile.

### 7.2 Publications
- Only **AuthorPro** users can create a Publication.
- The Publication **Owner** invites other Authors (free or Pro) to contribute.
- The invited Author must **explicitly accept** the invite/terms before they can publish into that Publication. A pending invite grants no access.
- Articles inside a Publication may be free or Premium, **at the contributing Author's discretion** — the Owner does not force Premium status on a contributor's article.
- An invite has three states: `pending`, `accepted`, `declined`. Declining does not delete the invite record (kept for history/audit), it just blocks access.

---

## 8. Platform Admin Capabilities

- **User management:** view, verify, suspend Readers and Authors (including AuthorPro).
- **Fee configuration:** subscription prices (AuthorPro, Publication, Platform — monthly & yearly each), pay-per-article default/min/max pricing rules, and the revenue split percentages from Section 5.1 (admin-editable, seeded to spec defaults).
- **Category management:** create, rename, delete/deprecate Categories.
- **Moderation queue:** review articles flagged via "Report this article," see the report reason, and action: dismiss, unpublish the article, or suspend the Author, per the platform's Terms & Conditions.
- **Future consideration (Phase 2, not built):** automated pre-publish content review via an AI model.

---

## 9. Third-Party Services (mapped to real tools for this build)

| Spec role | Chosen real service | Purpose |
|---|---|---|
| Payment Service Provider (PSP) | **Stripe** (Checkout + Billing + Connect) | Handles all Reader payments (one-off + subscriptions), Author/Publication payouts (Connect — stubbed in Phase 1, ledger-only), and subscription billing/invoicing. |
| Email service | **Resend** | Account verification emails, OTP delivery for 2FA, transactional notifications (invite emails, purchase receipts, moderation notices). |
| Database | **Neon** (serverless Postgres) | Primary datastore for all application data. |
| Auth | **Auth.js (NextAuth v5)** | Session management, credential + email verification flows, role-aware session tokens. OTP 2FA is layered on top for Authors (custom implementation, Auth.js does not natively provide OTP-2FA — see `04_MasterBuildGuide.md` Step 2.4). |
| Hosting/Deploy | **Vercel** | Production hosting, preview deployments, environment variable management, cron/edge functions if needed. |

---

## 10. Key User Flows (numbered — full detail and diagrams in `01_ApplicationFlow.md`)

### 10.1 Reader — purchasing a Premium article
1. Reader browses or searches and opens a Premium article.
2. Article body is shown truncated/locked with a paywall prompt.
3. Reader chooses: buy this article, subscribe to the Publication, or subscribe to the Platform.
4. Reader completes payment via Stripe.
5. Full article unlocks; access is recorded against the Reader's account; a ledger entry is written per Section 5.3.

### 10.2 Author — publishing a Premium article
1. Author (verified AuthorPro) writes/edits an article in the Medium-style editor.
2. Author selects a Category and adds Tags.
3. Author toggles the article to Premium and sets pricing (if applicable).
4. Author submits for publish; article goes live immediately (Phase 1: no pre-publish AI review).
5. Article appears on the Author's profile and, if applicable, inside the selected Publication.

### 10.3 AuthorPro — creating a Publication and inviting a contributor
1. AuthorPro user creates a new Publication (name, description, cover).
2. Owner searches for and invites another Author to contribute.
3. Invited Author receives the invite (in-app + email) and reviews terms.
4. Invited Author accepts (or declines).
5. On acceptance, the Author can now publish articles directly into that Publication.

### 10.4 Reader — subscribing to the Platform
1. Reader selects "Subscribe" and chooses monthly or yearly billing.
2. Reader completes payment via Stripe.
3. Any existing Publication-level subscription is cancelled/superseded automatically.
4. Reader gains ad-free, unlimited access to all Premium content.

### 10.5 Admin — reviewing a reported article
1. A Reader flags an article via "Report this article," selecting a reason.
2. Report enters the Admin moderation queue.
3. Admin reviews the article and report reason.
4. Admin actions the report: dismiss, unpublish, or suspend the Author, per T&Cs.

---

## 11. Out of Scope / Phase 2 (do not build unless explicitly asked)

- Direct-to-author payments (bypassing the Platform as intermediary).
- Multiple/tiered Platform subscription levels (Phase 1 = single tier per plan type).
- Read-time-weighted or scroll-depth-weighted revenue distribution for pooled subscriptions (Phase 1 = even split across distinct reads, "read" = article opened).
- AI-based automated pre-publish content review.
- Publications created by free (non-Pro) Authors.
- Live Stripe Connect payout transfers to Authors/Publication Owners (Phase 1 records the ledger correctly and stubs/defers the actual transfer call — see `04_MasterBuildGuide.md` Step 10).
- Native mobile apps (web-responsive only).
- Multi-language / i18n.

---

## 12. Open Questions Resolved for Build (so the agent never re-asks)

| Question from spec | Resolution used for this build |
|---|---|
| Which PSP? | **Stripe** — Checkout for one-off/pay-per-article, Billing/Subscriptions for AuthorPro/Publication/Platform plans, Connect for future payouts (stubbed Phase 1). |
| Which auth system? | **Auth.js (NextAuth v5, beta)** with the Credentials + Email provider pattern, backed by the Drizzle adapter into Neon. Custom OTP-2FA layer built on top for Authors (Resend delivers the OTP code by email). |
| Which ORM — Drizzle or Prisma? | **Drizzle ORM.** Justification: Drizzle has first-class support for Neon's serverless/edge HTTP driver (`@neondatabase/serverless` + `drizzle-orm/neon-http`), works cleanly in Vercel Edge/Serverless functions without connection-pool cold-start issues Prisma's binary engine can hit on edge runtimes, has a lighter runtime footprint, and its SQL-like query builder is easier for an AI coding agent to generate correct, reviewable migrations from a written schema doc. This choice is used consistently in `03_FolderStructure.md` and every schema-related step of `04_MasterBuildGuide.md`. |
| Definition of a qualifying "read" for pooled subscription distribution | Article opened/rendered past the paywall, deduplicated per (reader, article, billing period). See Section 5.2. |
| Revenue split numbers | Hardcoded defaults 80/20 (standalone) and 60/20/20 (in-publication), stored as admin-editable config rows, not literal constants in code. See Section 5.1. |
| What happens to Publications/Premium content if AuthorPro lapses | **Client-confirmed.** Existing content and Publications stay live; new Premium content / new Publications are blocked until re-subscribed. See Section 3 note. |
| Brand name | **Client-confirmed: "Contributor."** Used consistently throughout — see Section 1's naming note distinguishing the brand name from the unrelated domain term "Contributor" (Publication invite role). |
