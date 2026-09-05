# 04 — Master Build Guide

> This is the step-by-step build plan you (the freelancer) will hand to Claude Code, one step at a time, in order. Every step must be **completed and tested before you move to the next step** — do not skip ahead, and do not run steps out of order; the sequence is deliberately dependency-ordered (database before auth, auth before role-gated routes, roles before monetization, monetization before payouts, core CRUD before polish/animation, polish before final QA).

## ⏸️ Resuming? Read This First (new agent session, new model, or picking this back up later)

If you are a coding agent starting fresh on this project — a new chat, a different model, a session with no memory of prior conversation — **do this before anything else, before touching any code:**

1. Open and read `docs/06_ProjectState.md` in full. It is the live tracker of exactly what's been built, what's been decided, and what's next.
2. Find the "Current Position" block at the top of that file — it tells you the exact next step to work on.
3. Do **not** restart, redo, re-plan, or "improve" any step marked `✅ Done` in that file, even if your instinct is to re-verify from scratch — treat it as trustworthy ground truth, unless the user explicitly asks you to revisit it. If a step is marked `🔄 Built, awaiting user test`, ask the user whether it passed testing before doing anything else with it.
4. Check the **Key Decisions Log** in that file before making any "your choice, document which" decision below — if a prior session already chose (e.g. the confirmed color palette, the image-upload approach, the Publication-subscription pooling method), reuse that exact choice; do not silently pick a different one just because a different model is now doing the work.
5. Proceed from the "Next up" step, following this guide exactly as written below.

This mechanism exists specifically so that switching agents/models mid-build, or picking the project back up after a break, causes zero lost context and zero re-work.

## How to use this document

- Each step below is either an **Agent Task** (you paste the prompt block into Claude Code and let it work) or a **Manual Task** (something only you can do, in a dashboard/account, because it requires human judgment, ownership of a paid account, or clicking through a third-party website Claude Code cannot access).
- Every "Agent Task" prompt block explicitly tells Claude Code to re-read `00_ScopeDocument.md`, `02_ThemeGuideline.md`, `01_ApplicationFlow.md`, and — for any step that builds or touches a shared/reusable UI component — `07_ComponentArchitectureAndStandards.md` (reuse/coding/testing discipline) as needed rather than guessing — you do not need to paste those files' contents yourself, just make sure this whole `docs/` folder is inside the project Claude Code has access to.
- **Every step follows the same explicit 4-phase loop — this is a hard gate, not a suggestion, and applies to every step and sub-step in this document, including the 0.x sub-steps:**
  1. **Build** — run the step's Agent Task prompt.
  2. **Test** — run the step's own Testing checklist (below the Agent Task) exactly as written.
  3. **Bug-Find & Gap-Find** — a distinct pass that happens even when Testing technically passed. Explicitly look for two different kinds of problems the checklist alone won't catch: (a) **bugs** — things that work under the checklist's happy path but misbehave under an edge case the checklist didn't list (wrong role, empty input, a second click, a slow network); and (b) **gaps** — a feature, permission rule, or workflow step from `00_ScopeDocument.md` or `01_ApplicationFlow.md` that is relevant to *this* step but was never actually implemented, not merely something that looks visually broken. Tell Claude Code to actively hunt for both, not just wait for you to report a problem.
  4. **Fix & Re-test** — fix everything found in phase 3, then re-run phase 2's Testing checklist **in full from the top**, including items that passed before (a fix can silently break something that worked a moment ago). Only advance to the next step once phase 4's re-test passes cleanly with nothing outstanding from phase 3.
  A step is not "done" after phase 2 alone — it is only done once phase 4 completes clean. `06_ProjectState.md` should reflect this (see that file's own status-tracking notes).
- **After every step or sub-step — right after it's built, and again once the user confirms it passed testing — update `docs/06_ProjectState.md`** per that file's own instructions (flip status, log what was actually done, log any "your choice, document which" decision, update Current Position). This is not optional bookkeeping — it's what makes the project resumable by a different agent session or model without losing any context. Do this before reporting the step complete to the user.
- Steps with sub-parts are numbered `x.1`, `x.2`, etc. — treat each sub-part as its own mini "paste this, test this, update state" cycle if you want tighter feedback loops, or paste the whole step's prompt at once if you're comfortable.
- Tech stack (do not deviate): Next.js App Router + TypeScript, Tailwind CSS, shadcn/ui, Framer Motion + GSAP/ScrollTrigger + animate.css, Neon Postgres + **Drizzle ORM**, Auth.js (NextAuth v5), Stripe, Resend, Vercel. All decided and justified in `00_ScopeDocument.md` §12 — never ask the agent to re-decide these.

---

## Step 0 — Accounts & Environment Setup (all Manual Task, beginner-level)

You need zero prior coding experience for this step. Follow every click.

### 0.1 GitHub account + new repository
**Purpose:** GitHub stores your project's code and lets Vercel auto-deploy it.
**Instructions:**
1. Go to https://github.com and click "Sign up." Use your email, choose a username, verify your email.
2. Once logged in, click the "+" icon top-right → "New repository."
3. Name it `contributor`, keep it **Private**, do NOT initialize with a README (you'll push an existing project later), click "Create repository."
4. Leave this tab open — you'll need the repo URL later.
**Testing/Verification:** You should see an empty repository page with a URL like `github.com/yourname/contributor` and setup instructions.

### 0.2 Install Node.js, Git, and a code editor
**Purpose:** These are the basic tools every Next.js project needs on your computer.
**Instructions:**
1. Go to https://nodejs.org, download the **LTS** version, run the installer, accept all defaults.
2. Go to https://git-scm.com/downloads, download for your OS, run the installer, accept all defaults.
3. Install a code editor if you don't have one — download VS Code from https://code.visualstudio.com/ (Claude Code can also run directly in a terminal without VS Code, but VS Code gives you a place to see files).
4. Confirm Claude Code CLI is installed on your machine per Anthropic's setup instructions (already done if you're reading this inside Claude Code).
**Testing/Verification:** Open a terminal and run `node -v` (should print a version like `v20.x.x`) and `git --version` (should print a version number). If both print version numbers, you're set.

### 0.3 Vercel account + connect GitHub
**Purpose:** Vercel will host your live website and auto-deploy every time you push code to GitHub.
**Instructions:**
1. Go to https://vercel.com, click "Sign Up," choose "Continue with GitHub," authorize Vercel to access your GitHub account.
2. You don't need to import a project yet — that happens in Step 17. Just confirm the account exists.
**Testing/Verification:** You land on the Vercel dashboard showing your name/avatar top-right and an empty projects list.

### 0.4 Neon account + Postgres project
**Purpose:** Neon is your database — where all users, articles, subscriptions, etc. are stored.
**Instructions:**
1. Go to https://neon.tech, click "Sign Up," sign up with GitHub or email.
2. Click "Create a project." Name it `contributor`, choose the region closest to your users, click "Create Project."
3. On the project dashboard, find the "Connection String" box (usually under "Connection Details"). Copy the string that starts with `postgresql://...` — you will paste this into `.env.local` in step 0.8.
**Testing/Verification:** The Neon dashboard shows your project as "Active" with a green status dot, and you have the connection string copied somewhere safe (a temporary notes file).

### 0.5 Stripe account (test mode) + API keys + enable Connect
**Purpose:** Stripe handles all payments — pay-per-article, subscriptions, and (later) Author payouts.
**Instructions:**
1. Go to https://stripe.com, click "Start now," sign up with your email.
2. You'll land in the Stripe Dashboard in **Test mode** by default (toggle top-right should say "Test mode" — leave it there for the entire build; you only switch to Live mode in Step 17).
3. Go to Developers → API keys. Copy the "Publishable key" (`pk_test_...`) and "Secret key" (`sk_test_...`) — you'll need both in `.env.local`.
4. Go to Connect (left sidebar) → click "Get started" and enable Connect for your platform (choose "Platform or marketplace" as the use case). You don't need to finish full Connect onboarding now — Phase 1 stubs actual payouts — just enabling it is enough.
5. Go to Developers → Webhooks → "Add endpoint" — leave this for Step 17 (you need a live/deployed URL first); for local development, Claude Code will use the Stripe CLI to forward webhooks (covered in Step 8's Agent Task).
**Testing/Verification:** Your Stripe dashboard shows "Test mode" active, and you have both API keys saved somewhere safe.

### 0.6 Resend account + API key (transactional email)
**Purpose:** Resend sends verification emails, OTP codes, invite emails, and receipts.
**Instructions:**
1. Go to https://resend.com, click "Sign Up," sign up with email or GitHub.
2. On the dashboard, go to "API Keys" → "Create API Key," name it `contributor`, copy the key (starts with `re_...`).
3. Under "Domains," you can add your own domain later for production sending; for local development and testing, Resend provides a default sending address you can use immediately (check their dashboard's onboarding note for the exact test sender address).
**Testing/Verification:** You have an API key copied, and the dashboard shows the key listed under "API Keys."

### 0.7 Auth.js secret generation
**Purpose:** Auth.js needs a random secret to encrypt session tokens.
**Instructions:**
1. Open a terminal and run: `openssl rand -base64 32` (Mac/Linux/Git Bash) — if you don't have `openssl`, you can instead visit https://generate-secret.vercel.app/32 in your browser to get an equivalent random string.
2. Copy the output string — this becomes `AUTH_SECRET` in `.env.local`.
**Testing/Verification:** You have a random 32+ character string copied and saved.

### 0.8 Create local `.env.local` and Vercel environment variables
**Purpose:** These are the secret keys your app needs to talk to Neon, Stripe, Resend, and Auth.js.
**Instructions:**
1. Once your project folder exists (created in Step 0.5's scaffold below), create a file named `.env.local` in the project root.
2. Fill it in using this template (Claude Code will also generate `.env.example` with the same keys, no values):
```
DATABASE_URL=your_neon_connection_string
AUTH_SECRET=your_generated_secret
AUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (added in Step 17, leave blank for now)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=your_verified_or_test_sender_address
```
3. When you get to Step 17 (deployment), copy every one of these into Vercel: Project → Settings → Environment Variables, one row per key, for "Production" (and "Preview" if you want preview deploys to work too).
**Testing/Verification:** `.env.local` exists in your project root with all values filled in (Stripe webhook secret and production URLs can stay placeholder until Step 17), and the file is listed in `.gitignore` so it never gets pushed to GitHub.

### 0.9 Claude Code / agent setup basics
**Purpose:** Make sure Claude Code can see your whole project, including this `docs/` folder, so every Agent Task prompt below can reference these files by name.
**Instructions:**
1. Open Claude Code and point it at your project's root folder (the same folder where you'll run the scaffold command in Step 0.5) — make sure `docs/` (this folder) and `Refrence/` (the screenshots and spec) are both inside that root, so Claude Code can open them when a prompt tells it to.
2. To run a step below: copy the entire text inside the ` ```text ` block under "Agent Task," paste it as your message to Claude Code, and let it work. Do not edit the prompt unless you know why you're changing it.
3. If Claude Code cannot run terminal commands directly in your setup, it will tell you — in that case copy the command block yourself into your terminal and run it, then tell Claude Code you've done so.
**Testing/Verification:** Claude Code responds to a simple test message referencing `docs/00_ScopeDocument.md` (e.g. ask it "what are the 4 roles in this project?") and it correctly answers Reader / Author / AuthorPro / Platform Admin — confirming it can read your docs folder.

---

### 0.5 (continued) — Project scaffold commands

**Agent Task** (paste this block into Claude Code; if your setup can't run shell commands, copy it into your own terminal and run it yourself, then tell Claude Code it's done):

```text
Scaffold the Next.js project for the Contributor. Run these exact commands in order, in the parent folder that should contain the project (do not run inside an existing folder that already has files):

npx create-next-app@latest contributor --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint

cd contributor

npx shadcn@latest init

npm install framer-motion gsap
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
npm install next-auth@beta
npm install stripe @stripe/stripe-js
npm install resend @react-email/components
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react
npm install animate.css
npm install clsx tailwind-merge class-variance-authority

After running these, copy the "docs" and "Refrence" folders from the parent directory into the new "contributor" project root so they are version-controlled alongside the code (do NOT modify anything inside Refrence — it is read-only reference material; do NOT modify anything inside docs/00 through docs/05 — treat those six files as read-only reference specs you will read from throughout the build; docs/06_ProjectState.md is the one exception — it is a LIVE file you will update after every step from here on, per its own instructions and the guide's "How to use this document" section).

Immediately after copying, update docs/06_ProjectState.md: mark Step 0.5 (continued) as done in the Step-by-Step Status table, set "Current Position" → "Next up" to "Step 0.6 (Resend account + API key)", and set "Last updated by" to today's date and a short session identifier.

Initialize git, create a .gitignore that excludes node_modules, .env.local, .next, and create an initial commit. Then set the GitHub remote to the repository URL I created in Step 0.1 (I will paste the URL) and push the initial commit to the main branch.

Confirm when done by listing the top-level folder structure and confirming package.json includes every dependency listed above.
```

**Manual Task:** Paste your GitHub repo URL from Step 0.1 when Claude Code asks for it.

**Testing:** Your project folder now contains `package.json`, `src/`, `docs/`, `Refrence/`, and `.git`. Running `npm run dev` and opening `http://localhost:3000` shows the default Next.js starter page with no errors in the terminal.

---

## Step 1 — Database Schema & Drizzle Setup

**Purpose:** Every other feature depends on the database existing first. This step creates every table the whole platform needs, matching the Content Model and roles in `00_ScopeDocument.md`.
**Depends on:** Step 0 complete (Neon connection string available in `.env.local`).

**Agent Task:**
```text
Read docs/00_ScopeDocument.md in full, especially Section 3 (Content Model) and Section 5 (Monetisation & Revenue Split Rules), and docs/03_FolderStructure.md for where files belong.

Set up Drizzle ORM against our Neon Postgres database:

1. Create drizzle.config.ts at the project root pointing at DATABASE_URL from .env.local, with the schema folder set to ./drizzle/schema and migrations output to ./drizzle/migrations.
2. Create src/lib/db.ts that initializes the Drizzle client using drizzle-orm/neon-http and @neondatabase/serverless, reading DATABASE_URL from process.env.
3. Create the following schema files under drizzle/schema/, using Drizzle's pgTable syntax, with camelCase TS variable names and snake_case actual column names:

- users.ts: id (uuid pk), email (unique), passwordHash (nullable, Auth.js may use OAuth later), name, avatarUrl, role (enum: reader, author, admin — note AuthorPro is NOT a separate role value, it's a boolean/status derived from an active AuthorPro subscription, see subscriptions.ts), emailVerified (timestamp nullable), twoFactorEnabled (boolean), status (enum: active, suspended), createdAt, updatedAt.
- auth.ts: the standard Auth.js Drizzle adapter tables — accounts, sessions, verificationTokens — matching the official next-auth Drizzle adapter schema shape exactly so the adapter works without modification.
- categories.ts: id, name (unique), slug (unique), createdAt. Admin-managed only.
- tags.ts: id, name (unique), slug (unique), createdAt. Author-created, free-form.
- articles.ts: id, title, slug (unique), body (text, rich content stored as JSON or HTML — choose JSON for structured editor content), excerpt, coverImageUrl, categoryId (fk to categories), publicationId (fk to publications, nullable), isPremium (boolean, default false), priceCents (integer, nullable), status (enum: draft, published, unpublished), createdAt, updatedAt, publishedAt (nullable).
- Create a join table articleAuthors: articleId, userId, isPrimary (boolean) — supports joint authorship (multiple rows per article, all free-tier revenue-share-exempt per spec).
- Create a join table articleTags: articleId, tagId.
- publications.ts: id, name, slug (unique), description, coverImageUrl, ownerId (fk to users), createdAt.
- invites.ts (Publication contributor invites): id, publicationId, invitedUserId, invitedByUserId, status (enum: pending, accepted, declined), createdAt, respondedAt (nullable).
- subscriptions.ts: id, userId, type (enum: author_pro, publication, platform), publicationId (nullable, only set when type=publication), stripeSubscriptionId, stripeCustomerId, status (enum: active, cancelled, superseded, past_due), billingInterval (enum: monthly, yearly), currentPeriodStart, currentPeriodEnd, createdAt.
- purchases.ts (pay-per-article one-off): id, userId, articleId, amountCents, stripePaymentIntentId, createdAt.
- readEvents.ts: id, userId, articleId, billingPeriodStart (date), createdAt — with a unique constraint on (userId, articleId, billingPeriodStart) to enforce the "one qualifying read per reader per article per billing period" rule from docs/00_ScopeDocument.md Section 5.2.
- ledger.ts: id, articleId, sourceType (enum: purchase, publication_subscription, platform_subscription), sourceId (the purchases.id or subscriptions.id this entry came from), grossAmountCents, platformCents, authorCents, publicationOwnerCents (nullable), splitPercentagesUsed (JSON snapshot of the percentages applied), payoutStatus (enum: pending, paid — Phase 1 always pending, no real transfer yet), createdAt.
- reports.ts: id, articleId, reportedByUserId, reason (enum: spam, harassment, copyright, misinformation, other), status (enum: open, dismissed, actioned), adminActionTaken (enum nullable: dismissed, unpublished, author_suspended), actionedByUserId (nullable), createdAt, actionedAt (nullable).
- comments.ts: id, articleId (fk to articles), userId (fk to users), body (text), createdAt, deletedAt (nullable, soft delete). Flat, non-threaded, per docs/00_ScopeDocument.md Section 4 "Comments" note — any logged-in user can comment on any published article, free or Premium.
- otpCodes.ts: id, userId (fk to users), codeHash, expiresAt, consumedAt (nullable), createdAt. Used by Step 2.4's email-OTP 2FA for Author/Admin login — create this table now so Step 2 doesn't need a follow-up migration.
- notifications.ts: id, userId (fk to users, the recipient), type (enum: publication_invite, invite_accepted, invite_declined, moderation_action, author_pro_activated), message (text), linkUrl (nullable), isRead (boolean, default false), createdAt. Used by Step 9's in-app notification stub and fully wired in Step 13 — create this table now so neither step needs a follow-up migration.
- platformConfig.ts: a single-row (or key-value) table storing admin-editable fee configuration: authorProMonthlyCents, authorProYearlyCents, publicationSubMonthlyCents, publicationSubYearlyCents, platformSubMonthlyCents, platformSubYearlyCents, payPerArticleMinCents, payPerArticleMaxCents, standaloneAuthorSplitPct, standalonePlatformSplitPct, inPublicationAuthorSplitPct, inPublicationOwnerSplitPct, inPublicationPlatformSplitPct, updatedAt. Seed this table with defaults exactly matching docs/00_ScopeDocument.md Section 5.1 and Section 6 (standalone 80/20, in-publication 60/20/20).

4. Create drizzle/schema/index.ts exporting everything plus Drizzle relations() definitions connecting: users<->accounts/sessions, users<->articles (via articleAuthors), articles<->categories, articles<->tags (via articleTags), articles<->publications, publications<->invites, users<->subscriptions, users<->purchases, articles<->ledger entries, articles<->reports, articles<->comments, users<->comments, users<->otpCodes, users<->notifications.

5. Add npm scripts to package.json: "db:generate": "drizzle-kit generate", "db:migrate": "drizzle-kit migrate", "db:studio": "drizzle-kit studio".

6. Run the generate and migrate scripts against the real Neon database (DATABASE_URL from .env.local) so all tables actually exist, then run the seed for platformConfig defaults.

Do not invent additional tables beyond what's listed here unless something is structurally required to satisfy docs/00_ScopeDocument.md — if you believe one is needed, state why before adding it.
```

**Manual Task:** None beyond having the Neon connection string already in `.env.local` from Step 0.4/0.8.

**Testing:** Run `npm run db:studio` (or the equivalent script) — a browser tab opens showing Drizzle Studio connected to your Neon database, listing every table above with zero rows except `platform_config`, which should show one row with `standalone_author_split_pct = 80`, `standalone_platform_split_pct = 20`, `in_publication_author_split_pct = 60`, `in_publication_owner_split_pct = 20`, `in_publication_platform_split_pct = 20`.

---

## Step 2 — Authentication (signup/login/email verify/OTP 2FA) + Role Model

**Purpose:** Establishes who a user is and what role they hold before any role-gated feature can exist.
**Depends on:** Step 1 (users/auth tables exist).

### 2.1 Auth.js configuration + Drizzle adapter
**Agent Task:**
```text
Read docs/00_ScopeDocument.md Sections 2 and 12 for the role model and the confirmed choice of Auth.js (NextAuth v5) with a Drizzle adapter.

Set up Auth.js v5 in src/lib/auth.ts:
- Use the Drizzle adapter (@auth/drizzle-adapter) pointed at the users/accounts/sessions/verificationTokens tables from drizzle/schema/auth.ts and users.ts.
- Configure a Credentials provider for email+password login (hash passwords with bcrypt or argon2 — pick one, install it, and use it consistently for both signup and login comparison).
- Configure the session strategy as "jwt" but persist role and emailVerified/twoFactorEnabled state into the JWT callback so every session object exposes { id, email, role, emailVerified, twoFactorVerified } without an extra DB round trip on every request.
- Export auth, signIn, signOut, and the route handlers per the Auth.js v5 App Router pattern, wired into src/app/api/auth/[...nextauth]/route.ts.
- Set AUTH_SECRET and AUTH_URL from environment variables (already in .env.local).

Do not build any UI yet in this sub-step — configuration only. Confirm by showing me the final src/lib/auth.ts content.
```

### 2.2 Signup flow + auth modal (split-panel pattern)
**Agent Task:**
```text
Read docs/02_ThemeGuideline.md Section 5 ("Modal / Dialog — Auth modal") in full, and open Refrence/login.png to see the exact pattern before building anything. Also read docs/07_ComponentArchitectureAndStandards.md — this is the one AuthModal component for both login and signup, never a second modal.

Build a global AuthModal component in src/components/shared/AuthModal.tsx replicating login.png exactly:
- Split panel, left = dark background image with "Create Account" headline, supporting copy, and a "Sign Up" button that flips the modal into the signup form.
- Right = white panel. In login state: "Sign in to Contributor" headline (Contributor is the client-confirmed brand name — use it, not the reference site's "Wikilogy" wording), Username/Email field, Password field, Remember Me checkbox, full-width black Sign in button, "Lost Your Password?" and "Create Account" links below.
- In signup state (triggered by the left panel's Sign Up button): show Name, Email, Password, Confirm Password fields, role selector (Reader or Author — default Reader), a black "Create Account" submit button, and a link back to "Already have an account? Sign in."
- Use shadcn/ui Dialog as the base primitive, but override styling completely per docs/02_ThemeGuideline.md — no default shadcn look.
- Animate modal enter/exit with Framer Motion exactly as specified in the theme doc (scale-in + fade, 200ms enter / 150ms exit), respecting prefers-reduced-motion.
- Wire the modal to open from a "Sign Up" / "Login" trigger in the navbar (navbar itself is built in Step 3 — for now just export a useAuthModal hook in src/hooks/use-auth-modal.ts controlling open/closed/mode state so the navbar can call it later).

Implement the signup Server Action: validate with zod (src/lib/validators/auth.ts), hash the password, insert into users with role from the selector and emailVerified = null, then trigger the email verification send (Step 2.3 will implement the actual email — for now call a stub function sendVerificationEmail(user) that you will wire to Resend in 2.3).

This must be fully responsive per docs/02_ThemeGuideline.md Section 7 — on mobile the dark left panel must stack above or be replaced by a simplified header treatment (do not just shrink the two columns until unreadable).
```

### 2.3 Email verification (Resend)
**Agent Task:**
```text
Read docs/00_ScopeDocument.md Section 9 (Third-Party Services) confirming Resend is the email provider.

Implement email verification:
1. Create src/lib/resend.ts initializing the Resend client from RESEND_API_KEY.
2. Create src/emails/verify-email.tsx as a React Email template: clean, on-brand (use the same serif/sans pairing and crimson accent from docs/02_ThemeGuideline.md where email-client-safe), with a clear "Verify your email" button linking to /verify-email?token=... .
3. On signup (from Step 2.2), generate a verification token, store it in the verificationTokens table with an expiry (24 hours), and send the email via Resend using the template above. Replace the stub sendVerificationEmail function with this real implementation.
4. Build src/app/(auth)/verify-email/page.tsx: reads the token query param, validates it against the DB (exists, not expired, not used), sets users.emailVerified = now(), deletes/invalidates the token, and shows a success state with a "Continue to sign in" button (opens the AuthModal in login mode). Show a clear error state if the token is invalid/expired with a "Resend verification email" action.

Test the full loop yourself using a real email address you control before confirming this step is done.
```

### 2.4 OTP-based 2FA (Authors only)
**Agent Task:**
```text
Read docs/01_ApplicationFlow.md Flow C in full before building this.

Implement email-OTP 2FA required for the Author role (Readers do not need 2FA):
1. The otpCodes table already exists from Step 1's schema (drizzle/schema/otpCodes.ts) — do not recreate it, just use it.
2. Create src/lib/otp.ts: generateOtp(userId) creates a random 6-digit code, hashes and stores it with a 10-minute expiry, and sends it via Resend using a new src/emails/otp-code.tsx template. verifyOtp(userId, code) checks hash match, expiry, and marks consumed.
3. In the login flow (Credentials provider callback or a post-login server action), after a successful password check, if the user's role is "author" (or admin), do NOT immediately issue a full session — instead redirect to src/app/(auth)/verify-otp/page.tsx, having already called generateOtp to send the code.
4. Build the verify-otp page: 6-digit code input (auto-advancing single-box-per-digit UI is a nice touch but a single input is acceptable), submit calls verifyOtp, on success completes the sign-in (issues the real session with twoFactorVerified: true in the JWT), on failure shows an inline error and allows requesting a new code (rate-limit resend to once per 60 seconds).
5. Readers skip this step entirely and get a normal session immediately after password check.

Ensure Reader signup/login never triggers OTP — only Author and Admin roles do, per docs/00_ScopeDocument.md Section 2.
```

### 2.5 Login flow wiring
**Agent Task:**
```text
Connect the AuthModal's login form (built in 2.2) to Auth.js's signIn("credentials", ...) using the Credentials provider from 2.1, routing through the OTP step from 2.4 when applicable. Handle and display inline error states for: wrong password, unverified email (with a resend-verification link), and suspended account (per docs/00_ScopeDocument.md admin capabilities — show "Your account has been suspended, contact support" and block sign-in). Add a "Remember Me" behavior that extends session/cookie expiry when checked (e.g. 30 days vs default session length).
```

### 2.6 Role-based route protection
**Agent Task:**
```text
Read docs/00_ScopeDocument.md Section 3 (Role & Permission Matrix) in full.

Implement server-side route protection:
1. Create src/lib/permissions.ts exporting helpers: requireAuth(), requireRole(role), requireAuthorPro() (checks an ACTIVE, non-expired subscriptions row with type=author_pro for the current user, not just a cached flag — query the DB), requireVerifiedAuthor() (email verified + twoFactorVerified in session).
2. Apply these at the top of every route under src/app/(dashboard)/author/**, src/app/(dashboard)/reader/**, and src/app/(dashboard)/admin/** — reader routes require any authenticated user, author routes require role=author or admin with email+OTP verified, admin routes require role=admin.
3. Also protect the underlying API/Server Actions themselves (not just the page component) — a direct API call must be rejected server-side even if someone bypasses the UI.
4. Unauthenticated users hitting a protected route should be redirected to the homepage with the AuthModal auto-opened in login mode, not shown a generic 404 or blank page.

This is a security-critical step — do not trust any role/permission check that only happens in client-side React state.
```

**Manual Task:** None beyond having Resend API key configured.

**Testing:**
- Sign up as a Reader with a real email you control → receive verification email → click it → can log in immediately, no OTP prompt.
- Sign up as an Author with a real email → verify email → attempt login → receive a 6-digit OTP email → enter it → land in `/dashboard/author`.
- Try visiting `/dashboard/admin` while logged in as a Reader → you should be bounced out, not shown the admin page.
- Log out, try visiting `/dashboard/author` directly → the homepage loads with the login modal open.

---

## Step 3 — Core Layout Shell (Navbar, Footer, Theme Tokens)

**Purpose:** Establishes the visual chrome and design tokens every later page builds inside.
**Depends on:** Step 2 (navbar needs auth state for login/account icons).

**Agent Task:**
```text
Read docs/02_ThemeGuideline.md in full before starting, and docs/07_ComponentArchitectureAndStandards.md Section 1 for the reusable-component rules Navbar/Footer/DashboardSidebar/DashboardTopbar must follow (built once, reused everywhere — never a per-dashboard-role copy). Open Refrence/home_ref.png and Refrence/about (2).png to see the navbar and footer in context.

1. Read docs/02_ThemeGuideline.md Section 2's instructions on the color palette carefully: the hex values listed are a STARTING POINT, not a literal spec to copy from the reference screenshots. Before wiring anything, propose a refined color palette that keeps the same token structure/usage (one ink neutral, one bold sparingly-used accent, warm-neutral background, muted text ramp) but improves the actual hues using real color theory — better contrast, better harmony between accent and neutrals, a less "stock corporate red" accent if a more premium-feeling hue achieves the same boldness. Show me a brief before/after swatch comparison and get my confirmation before locking it in (this is a highly visible, hard-to-cheaply-undo decision). Once confirmed, wire the final color, spacing, and typography tokens from docs/02_ThemeGuideline.md Sections 2-4 into tailwind.config.ts (theme.extend.colors, fontFamily, fontSize, spacing) and src/styles/tokens.css as CSS variables, imported into src/app/globals.css. Load Fraunces (display/serif) and Inter (body/sans) via next/font/google in the root layout. Override the shadcn/ui button radius token to 4px per the theme doc — do not leave default shadcn rounded styling anywhere.

2. Build src/components/shared/Navbar.tsx matching Refrence/home_ref.png: black background, logo left ("Contributor" wordmark — the client-confirmed brand name, per docs/00_ScopeDocument.md Section 1), nav links (Homepage, Content Listing, Create Content, About, Contact), right-side icon cluster (search trigger opening the search overlay — stub for now, built in Step 6 — purchases/cart icon, login/account icon that opens AuthModal from Step 2 or shows an account dropdown if logged in), hamburger icon on mobile opening a slide-in drawer. Make it sticky with a subtle blur+shadow after scrolling past 40px (Framer Motion or CSS, respecting prefers-reduced-motion). Fully responsive per docs/02_ThemeGuideline.md Section 7.

3. Build src/components/shared/Footer.tsx matching Refrence/home_ref.png's footer: black background, top "Get Inside the hustle" newsletter signup band (email input + submit + terms checkbox — wire the form to a stub function for now, real newsletter capture is out of scope for Phase 1 unless later requested), 4-column layout (Company blurb, Latest Contents list, Featured cover, Suggestions Contents list) collapsing to stacked single column on mobile, bottom bar with "Contributor" wordmark/copyright/legal links/social icons.

4. Wire Navbar + Footer into src/app/(marketing)/layout.tsx and src/app/(dashboard)/layout.tsx (dashboard uses a simpler top bar + sidebar shell instead of the full marketing navbar — build src/components/dashboard/DashboardSidebar.tsx and DashboardTopbar.tsx now as basic functional shells; full dashboard visual polish happens in the animation/polish pass, Step 15).

This must not look like default shadcn/ui or a generic SaaS template — follow docs/02_ThemeGuideline.md precisely, including the restrained use of the crimson accent color (Section 2 note about primary buttons being ink-black by default with red reserved for accents).
```

**Manual Task:** None.

**Testing:** Load the homepage placeholder — you see the black sticky navbar with working mobile hamburger drawer, and scrolling to the bottom shows the dark 4-column footer with a working newsletter input (visually, even if not yet functionally wired to a real list). Resize your browser to phone width — navbar collapses correctly, footer stacks to one column.

---

## Step 4 — Article CRUD (Free Author)

**Purpose:** Core content creation for the free Author tier — the foundation every later monetization/publication feature builds on.
**Depends on:** Steps 1–3.

**Agent Task:**
```text
Read docs/00_ScopeDocument.md Section 3 (Content Model) and Section 3 Role matrix (Author free-tier row), and docs/01_ApplicationFlow.md Flow D.

Build free-tier Article CRUD for verified Authors:
1. src/app/(dashboard)/author/articles/page.tsx: table/list of the logged-in Author's own articles (title, status, category, created date, edit/delete actions). Use requireVerifiedAuthor() from Step 2.6.
2. src/app/(dashboard)/author/articles/new/page.tsx and articles/[id]/edit/page.tsx: a basic (not-yet-Medium-styled — that visual pass is Step 12) article form: title, body (plain rich-text for now via a simple contentEditable or a basic textarea — full Medium-style editor UX comes in Step 12), Category select (populated from the categories table, single-select, required), Tags input (free-form, comma-or-enter-to-add, creates new tags on the fly, many-to-many via articleTags), cover image upload (store via a simple file upload approach — Vercel Blob or base64-to-URL placeholder, your choice, document which you used), Publish button and Save Draft button.
3. Free-tier Authors must NOT see any Premium toggle or price field anywhere in this form — that UI only appears for AuthorPro users (built in Step 8). Enforce this server-side too: reject isPremium=true on the article insert/update if the author does not have an active author_pro subscription.
4. Support joint authorship: an "Add co-author" field that searches existing Authors by username/email and adds them to articleAuthors. Jointly authored articles must always have isPremium forced to false server-side, regardless of any co-author's Pro status, per docs/00_ScopeDocument.md Section 7.1 — this is a hard rule, do not allow a UI or API path around it.
5. On publish, set status="published", publishedAt=now(), generate a unique slug from the title (src/lib/slugify.ts).
6. Article deletion: soft behavior preferred — set status back to a non-visible state rather than hard-deleting, to preserve ledger/report history integrity for anything already monetized later.

Keep visual polish minimal here (functional, on-theme colors/fonts is enough) — the dedicated Medium-style editor experience is built later in Step 12 and will replace this form's editing surface.
```

**Manual Task:** None.

**Testing:** Log in as a verified Author, create a new article with a category and two tags, publish it, see it appear in "My Articles." Try adding a co-author (another test Author account) and confirm the Premium toggle is nowhere visible for a free-tier Author.

---

## Step 5 — Homepage + Content Listing + Single Article Pages (Public)

**Purpose:** The public-facing reading experience — where Readers actually encounter content, matching the theme reference precisely.
**Depends on:** Steps 3–4 (need articles to display, navbar/footer shell to wrap them).

**Agent Task:**
```text
Read docs/02_ThemeGuideline.md in full again, specifically Sections 4-5 (layout system, article card, hero) and Section 8 (Application States — every list/grid below needs its empty state, e.g. an empty category listing, wired using the shared EmptyState component). Also read docs/07_ComponentArchitectureAndStandards.md Section 1 — ArticleCard is one component reused across homepage/listing/search/related/publication pages, never forked per page. Open Refrence/home_ref.png, Refrence/content_lis.png, and Refrence/single_art.png side-by-side before building — match their structure precisely, elevated per the theme doc's "ultra polished" direction.

1. Build the homepage src/app/(marketing)/page.tsx matching Refrence/home_ref.png section-by-section:
   - Hero: large headline over a dark background image (use the most recent published article as the hero, or an admin-pinned "featured" article if you build that concept — keep it simple: most recent published article for Phase 1), with a thumbnail rail of the next 4 recent articles beside/below it.
   - 3-column magazine card grid section(s) using the ArticleCard component (build src/components/shared/ArticleCard.tsx per docs/02_ThemeGuideline.md Section 5 spec exactly: cover image, eyebrow category+date, title, excerpt, byline).
   - "Editor's Picks" module: large featured story left + numbered 01-04 list right, per the theme doc's Section 4 layout description.
   - A promotional/newsletter or ad-style banner strip (simple, on-theme, can link to AuthorPro upgrade or just be decorative for now).
   - Additional 2-3 card grid sections for variety, matching the dense magazine feel of home_ref.png.
   All sections pull real data from the articles table (most recent, by category, etc. — reasonable query logic, no fake/hardcoded content).

2. Build the Content Listing page src/app/(marketing)/content/page.tsx matching Refrence/content_lis.png: red hero band with "Discover All Topics" eyebrow, "Content Listing" headline, supporting copy, then a full 3-column paginated grid of ALL published articles (12 per page), with the Pagination component from docs/02_ThemeGuideline.md Section 5. Build src/app/(marketing)/content/[category]/page.tsx as the same page filtered to one category, with the hero band headline swapped to the category name.

3. Build the single article page src/app/(marketing)/article/[slug]/page.tsx matching Refrence/single_art.png: full-width or large hero cover image, headline, byline with avatar, article body rendered from the stored content, a "Table of Contents" or share-icon sidebar if space allows (match the reference's right-rail treatment), related articles grid at the bottom, and a comments section (per docs/00_ScopeDocument.md Section 4 "Comments"): build src/components/article/CommentList.tsx and CommentForm.tsx using the comments table from Step 1 — flat list ordered newest-first (or oldest-first, match single_art.png's visual order), each comment showing avatar + author name + timestamp + body, a comment form below requiring login (open AuthModal if not authenticated), and a delete action visible only to the comment's own author or an Admin (soft-delete via deletedAt, never hard-delete). Comments must render identically on free and Premium articles regardless of paywall state — they are never gated. Style per docs/02_ThemeGuideline.md's typography/spacing tokens, not default unstyled markup. Do NOT implement the paywall/lock UI in this step — that's Step 8; for now all articles render fully since Premium doesn't exist yet functionally at this point in the build.

4. Build the "Report this article" feature (per docs/00_ScopeDocument.md Section 8 and Flow H in docs/01_ApplicationFlow.md — this is what feeds the Admin moderation queue built later in Step 11, so it must exist now): a small flag/report icon or text link on the single article page (any logged-in Reader or Author can use it; unauthenticated visitors are prompted to log in first via AuthModal), opening a small dialog with a required reason select (spam, harassment, copyright, misinformation, other per the reports table's enum from Step 1) and an optional free-text detail field. Build src/app/api/reports/route.ts: POST handler inserting a reports row (articleId, reportedByUserId, reason, status="open"), rejecting duplicate open reports from the same user on the same article (a user can only have one open report per article at a time — prevent spam-reporting, but allow a new report if their prior one was already actioned/dismissed). On successful submit, show a brief confirmation toast ("Thanks, we'll review this") and close the dialog — do not show the reporter any further status; report status/actioning is Admin-only (Step 11).

Every card, hero, and grid built in this step must be fully responsive per docs/02_ThemeGuideline.md Section 7, and must NOT look like generic default shadcn/Tailwind styling — follow the token system precisely.
```

**Manual Task:** None.

**Testing:** Visit the homepage — you see a hero article, thumbnail rail, multiple 3-col card grids, and an Editor's Picks module, all populated with your real test articles. Visit `/content` — paginated grid with working page numbers. Click any article — full single-article page renders with byline, body, related articles, and a comment section. Post a test comment while logged in — it appears immediately in the list; log in as a different user and confirm you cannot delete someone else's comment, only your own. Click "Report this article," submit a report with a reason — confirm a success toast appears and the dialog closes; try reporting the same article again as the same user and confirm you're blocked from submitting a second open report. Resize to mobile — everything stacks to one column cleanly.

---

## Step 6 — Search

**Purpose:** Lets Readers find content quickly, matching the distinctive full-screen search UI from the reference.
**Depends on:** Step 5 (needs articles to search over).

**Agent Task:**
```text
Read docs/02_ThemeGuideline.md Section 5 ("Search overlay") and Section 8 ("Application States" — the results grid needs the "No results for '{query}'" empty state via the shared EmptyState component) and open Refrence/search.png before building — replicate this exact pattern.

1. Build src/app/api/search/route.ts: a GET endpoint accepting a `q` query param, searching articles by title/excerpt/tags (simple ILIKE/full-text match against Postgres is sufficient for Phase 1 — no external search service needed), returning published articles only, limited to a reasonable count (e.g. 24).

2. Build src/components/shared/SearchOverlay.tsx as a full-screen (90vh) overlay: centered giant "Type here to search..." input (autofocus on open, ~40px+ font per the theme doc), a row of popular keyword pill buttons below it (pull the 5 most-used Categories or Tags as the "popular" pills, not hardcoded English words), and a live 3-column results grid below that updates as the user types (debounce 300ms) using the ArticleCard component from Step 5. Clicking a pill fills the input and triggers a search immediately.

3. Wire the SearchOverlay to open from the Navbar's search icon (from Step 3) via a src/hooks/use-search-overlay.ts hook. Overlay enter/exit animation exactly per docs/02_ThemeGuideline.md Section 6 (fade + slight slide, Framer Motion, respecting prefers-reduced-motion). Overlay closes on: close icon click, outside click (clicking the scrim), or Escape key.

4. Also build src/app/(marketing)/search/page.tsx as a deep-linkable version (for when someone shares a search URL like /search?q=history) rendering the same results grid without the overlay chrome, for SEO/shareability.
```

**Manual Task:** None.

**Testing:** Click the search icon in the navbar — full-screen overlay opens with autofocus. Type a word matching one of your test articles' titles — results appear live below within ~a third of a second after you stop typing. Click a popular-keyword pill — it fills the search and shows matching results. Press Escape — overlay closes.

---

## Step 7 — AuthorPro Upgrade + Stripe Subscription Billing for Authors

**Purpose:** Unlocks the monetization tier for Authors — required before Premium articles or Publications can exist.
**Depends on:** Steps 1, 2, 6 (needs users/subscriptions tables, auth, and a stable app shell).

**Agent Task:**
```text
Read docs/00_ScopeDocument.md Sections 5, 6, and 9 (revenue splits, subscription structure, Stripe as PSP), and docs/01_ApplicationFlow.md Flow E.

1. Create src/lib/stripe.ts initializing the Stripe client from STRIPE_SECRET_KEY.
2. Build src/app/(dashboard)/author/billing/page.tsx: shows current AuthorPro status (none/active/cancelled), and if not active, a "Go Pro" section with monthly/yearly plan toggle, pricing pulled LIVE from the platformConfig table (authorProMonthlyCents / authorProYearlyCents), not hardcoded — read docs/00_ScopeDocument.md Section 8 confirming these are admin-configurable.
3. Build src/app/api/checkout/subscription/route.ts: a POST handler that creates a Stripe Checkout Session in subscription mode for type="author_pro", using a Stripe Price created dynamically or a pre-created Stripe Product/Price synced from platformConfig (your choice of implementation — document which), with success_url redirecting back to /dashboard/author/billing?success=true and cancel_url back to the same page.
4. Build src/app/api/webhooks/stripe/route.ts (raw body, verify signature using STRIPE_WEBHOOK_SECRET): handle checkout.session.completed for author_pro subscriptions by inserting/updating a row in the subscriptions table (status=active, correct billingInterval, currentPeriodStart/End from the Stripe subscription object, stripeSubscriptionId, stripeCustomerId). Handle customer.subscription.updated and customer.subscription.deleted to keep status in sync (active/past_due/cancelled).
5. Set up Stripe CLI forwarding for local testing: instruct me (the user) to run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` in a terminal and paste the printed webhook signing secret into STRIPE_WEBHOOK_SECRET in .env.local.
6. Once a user's author_pro subscription is active, requireAuthorPro() from Step 2.6 must now correctly return true, unlocking the Premium toggle (Step 8) and Create Publication action (Step 9).

Use Stripe TEST MODE keys only at this stage — live mode cutover happens in Step 17.
```

**Manual Task:** Run the `stripe listen --forward-to localhost:3000/api/webhooks/stripe` command yourself in a terminal (the Stripe CLI must be installed — download from https://stripe.com/docs/stripe-cli — Agent Task can attempt this but if it can't run a long-lived background process in your setup, you run it) and paste the printed webhook secret into `.env.local`.

**Testing:** As a verified free Author, go to Billing, click Go Pro, complete a test-mode Stripe Checkout using Stripe's test card `4242 4242 4242 4242` with any future expiry/CVC — you should land back on the billing page showing "AuthorPro Active." Confirm in Drizzle Studio that a `subscriptions` row exists with `type=author_pro, status=active`.

---

## Step 8 — Premium/Paywall Article Logic + Pay-Per-Article Stripe Checkout

**Purpose:** The core monetization mechanic for individual articles.
**Depends on:** Step 7 (AuthorPro status required to create Premium content).

**Agent Task:**
```text
Read docs/00_ScopeDocument.md Sections 5 and 6 in full, and docs/01_ApplicationFlow.md Flow B and Flow F. Open docs/02_ThemeGuideline.md Section 5 ("Paywall / lock UI treatment") and Refrence/single_art.png.

1. In the article editor (Step 4's form), add a Premium toggle + price field, visible ONLY when requireAuthorPro() is true for the logged-in user. Price must be validated against platformConfig.payPerArticleMinCents/MaxCents. Enforce server-side: any attempt to set isPremium=true from a non-Pro account or a jointly-authored article must be rejected regardless of client state.

2. Build the paywall UI on the single article page (src/app/(marketing)/article/[slug]/page.tsx from Step 5): if article.isPremium and the current viewer has no qualifying access (no purchase row for this article, no active publication subscription matching article.publicationId, no active platform subscription), render the body truncated with the gradient-fade + lock-card overlay exactly per docs/02_ThemeGuideline.md's paywall spec, offering: Buy this article ($price), Subscribe to [Publication name] (only if article belongs to a Publication), Subscribe to the Platform.

3. Build src/app/api/checkout/article/route.ts: POST handler creating a Stripe Checkout Session in one-time payment mode for the article's price, storing articleId + userId in session metadata.

4. Extend the Stripe webhook handler (src/app/api/webhooks/stripe/route.ts from Step 7) to handle checkout.session.completed for one-time article purchases: insert a purchases row, then call a new src/lib/revenue-split.ts function calculateAndRecordSplit(articleId, grossAmountCents, sourceType="purchase", sourceId) that reads the CURRENT platformConfig split percentages, determines standalone vs in-publication based on whether the article has a publicationId, and inserts the correct ledger row per docs/00_ScopeDocument.md Section 5.1 (80/20 standalone, 60/20/20 in-publication) with payoutStatus="pending" (actual Stripe Connect transfer is stubbed — do not attempt a real transfer call yet, just record the ledger correctly; add a clear TODO comment referencing docs/00_ScopeDocument.md Section 5.3 and Section 11 for where the real payout would be wired in Phase 2).

5. On successful purchase, redirect back to the article page, now unlocked, and record the access so requireAccess checks pass immediately without waiting on webhook race conditions (e.g. optimistic unlock using the Checkout Session ID, reconciled by the webhook).

Test the full revenue-split math yourself with at least one standalone article purchase and confirm the ledger numbers add up exactly to the gross amount (author + platform cents must sum to the gross for standalone; author + owner + platform cents must sum to the gross for in-publication — do this math with integer cents, not floats, to avoid rounding drift, and document how you handled any remainder cent).
```

**Manual Task:** None beyond ensuring the Step 7 Stripe CLI webhook forwarding is still running locally.

**Testing:** As AuthorPro, mark a test article Premium with a price (e.g. $5.00). Log in as a different Reader account, open that article — see the truncated body + paywall card with three options. Click "Buy this article," complete test-mode checkout, get redirected back with the full article now visible. Check Drizzle Studio: a `purchases` row and a matching `ledger` row exist, with `author_cents + platform_cents = gross_amount_cents` exactly (500 → 400 author / 100 platform for a standalone article).

---

## Step 9 — Publications (Create, Invite, Accept/Decline, Multi-Author Articles)

**Purpose:** Enables the Publication/magazine collaboration model central to the platform's differentiation.
**Depends on:** Step 7 (AuthorPro required to create a Publication), Step 4 (article publishing).

**Agent Task:**
```text
Read docs/00_ScopeDocument.md Section 7 (Collaboration & Publications Workflow) and docs/01_ApplicationFlow.md Flow G in full.

1. Build src/app/(dashboard)/author/publications/page.tsx (list of Publications the user owns or contributes to) and publications/new/page.tsx (create form: name, description, cover image — only reachable if requireAuthorPro() is true; free Authors must not see this page at all, redirect them with a clear "Upgrade to AuthorPro to create a Publication" message instead of a bare 403).

2. Build src/app/api/users/search/route.ts: a GET endpoint accepting a `q` query param, searching users by username/email/name, restricted to role=author or role=admin (never returns suspended accounts), limited to a reasonable count (e.g. 10) — used by the Contributors search below and reusable later wherever "find an Author by name/email" is needed.

3. Build src/app/(dashboard)/author/publications/[id]/page.tsx: Publication management view for the Owner, with a "Contributors" tab (uses the search endpoint above to find existing Authors by username/email, send invite — creates an invites row with status=pending, sends an email via a new src/emails/publication-invite.tsx template through Resend, and inserts a row into the notifications table from Step 1 for the invited Author — the bell-icon UI for reading these notifications is fully wired in Step 13, this step just needs to write the row) and an "Articles" tab (list of articles published into this Publication).

4. Build the invite response experience: a route or dashboard section (e.g. src/app/(dashboard)/author/invites/page.tsx) listing pending invites for the logged-in Author, showing Publication name/description/Owner, with Accept and Decline buttons. Accepting sets invites.status=accepted and respondedAt=now(), and inserts a notifications row for the Publication Owner (invite_accepted); the Author can now select this Publication in the article editor's Publication dropdown (add this dropdown to the Step 4 article form now, populated only with Publications the Author has accepted into, or owns). Declining sets status=declined, no access granted, and inserts a notifications row for the Owner (invite_declined).

5. Build the public Publication page src/app/(marketing)/publication/[slug]/page.tsx: cover, name, description, Owner byline, grid of the Publication's published articles (reuse ArticleCard from Step 5).

6. When an Author who has accepted a Publication invite publishes an article and selects that Publication, set articles.publicationId accordingly — this is what Step 8's in-publication 60/20/20 revenue split logic keys off of. Confirm the article's Premium/free status remains "at the contributing Author's discretion" per spec — the Publication Owner does not get a UI control to force another contributor's article to Premium or free.
```

**Manual Task:** None.

**Testing:** As AuthorPro user A, create a Publication. Invite test Author B by email/username. Log in as Author B, see the pending invite, accept it. Publish a new article as B, select A's Publication in the dropdown, mark it Premium. Purchase that article as a Reader and confirm (via Drizzle Studio) the ledger entry shows the 60/20/20 split with `publication_owner_cents` populated and attributed to A's Publication.

---

## Step 10 — Reader Subscriptions (Publication + Platform, Supersede Logic) + Revenue Split Ledger for Pooled Subscriptions

**Purpose:** Completes the monetization model with recurring subscriptions and the pooled-subscription revenue distribution required by the spec.
**Depends on:** Steps 7, 8, 9.

**Agent Task:**
```text
Read docs/00_ScopeDocument.md Sections 5.2 and 6 in full, and docs/01_ApplicationFlow.md Flow B step 6 and Flow J in full before building.

1. Extend src/app/api/checkout/subscription/route.ts (from Step 7) to also handle type="publication" (requires a publicationId) and type="platform" for Reader-initiated subscriptions, using pricing from platformConfig (publicationSubMonthlyCents/YearlyCents, platformSubMonthlyCents/YearlyCents).

2. Extend the Stripe webhook handler: on checkout.session.completed for a platform subscription, BEFORE inserting the new subscriptions row, check for any existing active subscriptions row for this user with type="publication" — if found, cancel it via the Stripe API (stripe.subscriptions.cancel) and update its local status to "superseded". Then insert the new active platform subscription row. This implements the exact supersede rule from docs/00_ScopeDocument.md Section 6 and Flow J.

3. Build src/app/(dashboard)/reader/subscriptions/page.tsx: shows the Reader's current subscriptions (Publication and/or Platform) with status, renewal date, and a Cancel action (calls Stripe to cancel, updates local status). If they have an active Publication subscription and try to also subscribe to the Platform, show a confirming dialog explaining the Publication subscription will be superseded (per docs/00_ScopeDocument.md Section 6, this must be ALLOWED, not blocked — just clearly communicated).

4. Implement the pooled Platform-subscription revenue distribution job in src/lib/revenue-split.ts: distributePlatformSubscriptionRevenue(subscriptionId, billingPeriodStart, billingPeriodEnd) — queries readEvents for this user within the billing period, counts DISTINCT premium articleIds read, divides the subscription's gross amount evenly across them (integer cents, document your rounding-remainder handling, e.g. give the remainder cent(s) to the first article encountered), then calls the same per-article split logic from Step 8 (standalone 80/20 or in-publication 60/20/20 depending on each article's publicationId) to write one ledger row per article with sourceType="platform_subscription". Wire this to run on each Stripe invoice.payment_succeeded webhook event for a platform subscription's renewal (i.e., at the end of each billing period, distribute the period just completed). If zero Premium articles were read in the period, the full amount's split responsibility with no articles to attribute to should still be recorded as a ledger row with sourceType="platform_subscription", articleId=null, 100% to Platform, and a clear comment explaining why (no qualifying reads that period).

5. Also implement the equivalent (simpler) distribution for Publication subscriptions: a Publication subscription's revenue is NOT pooled across multiple publications (a Reader only accesses ONE Publication's content with it), but still needs the same per-article split logic applied per read event within that single Publication for the period, following the same even-split-across-distinct-reads approach for consistency, OR — simpler and equally spec-compliant, since a Publication subscription only ever grants access to one Publication's articles — you may instead treat a Publication subscription's periodic revenue as pooled across only that Publication's distinct articles read in the period, using the in-publication 60/20/20 split for each. Implement this second (Publication-scoped pooling) approach, and document the choice inline in code comments referencing this instruction.

6. Ensure src/lib/revenue-split.ts logs a readEvents row every time a Reader opens a Premium article they have qualifying subscription access to (not needed for pay-per-article purchases, since those are already fully attributed at purchase time) — wire this into the article page view logic from Step 8, deduplicated per docs/00_ScopeDocument.md Section 5.2's (userId, articleId, billingPeriodStart) uniqueness rule.
```

**Manual Task:** Ensure Stripe CLI webhook forwarding (Step 7) is still active locally; you may need to trigger a test `invoice.payment_succeeded` event manually via `stripe trigger invoice.payment_succeeded` for testing per Stripe CLI docs — Claude Code will tell you the exact command if needed.

**Testing:** As a Reader, subscribe to a Publication (test card), confirm access to that Publication's Premium articles without individual purchase. While that subscription is active, subscribe to the Platform — confirm (Drizzle Studio) the Publication subscription's status flips to "superseded" and is cancelled in the Stripe dashboard test mode too. Read 2-3 distinct Premium articles as this Reader, then manually trigger the period-end webhook event, and confirm ledger rows were created splitting the subscription's gross amount evenly across those articles with the correct 80/20 or 60/20/20 split per article.

---

## Step 11 — Admin Dashboard (User Management, Fee Config, Category Management, Moderation Queue)

**Purpose:** Gives Platform Admins the controls defined in the spec — without this, fees can never be changed from seed defaults and reported content can never be actioned.
**Depends on:** Steps 1, 2, 5, 8 (needs the reports table AND the actual "Report this article" submission flow from Step 5 to have real report rows to queue, plus subscriptions/purchases to view and platformConfig to edit).

**Agent Task:**
```text
Read docs/00_ScopeDocument.md Section 8 (Platform Admin Capabilities) and docs/01_ApplicationFlow.md Flows H and I in full. Also read docs/02_ThemeGuideline.md Section 8 — every admin table below (users, moderation queue, categories) needs its own empty state via the shared EmptyState component when there's nothing to show.

Build the admin dashboard under src/app/(dashboard)/admin/ (protected by requireRole("admin") from Step 2.6):

1. admin/users/page.tsx: paginated table of all Readers/Authors (id, name, email, role, status, AuthorPro active y/n, joined date), with row actions: View, Verify (manually mark emailVerified if needed), Suspend/Unsuspend (toggles users.status, and per docs/00_ScopeDocument.md a suspended Author's articles must be hidden from public view — enforce this in the article query layer: never show articles where the author's account status is "suspended").

2. admin/moderation/page.tsx: the reports queue, listing open reports (article title, reporter, reason, reported date), clicking a row opens a detail view showing the full article content + report reason, with three actions exactly per spec: Dismiss (reports.status=dismissed), Unpublish (articles.status=unpublished, hidden from public immediately, reports.status=actioned, adminActionTaken=unpublished), Suspend Author (users.status=suspended for the article's author, cascades to hide all their articles per point 1 above, reports.status=actioned, adminActionTaken=author_suspended). Log actionedByUserId and actionedAt on every action for audit.

3. admin/settings/fees/page.tsx: a form bound to the single platformConfig row, editing: authorProMonthlyCents/YearlyCents, publicationSubMonthlyCents/YearlyCents, platformSubMonthlyCents/YearlyCents, payPerArticleMinCents/MaxCents, and the FIVE revenue split percentage fields (standaloneAuthorSplitPct, standalonePlatformSplitPct, inPublicationAuthorSplitPct, inPublicationOwnerSplitPct, inPublicationPlatformSplitPct). Validate that standaloneAuthorSplitPct + standalonePlatformSplitPct = 100, and inPublicationAuthorSplitPct + inPublicationOwnerSplitPct + inPublicationPlatformSplitPct = 100, rejecting saves that don't balance. Clearly label that changes apply to FUTURE transactions only, not retroactively to existing ledger entries or active subscriptions (per docs/00_ScopeDocument.md Section 8/Flow I).

4. admin/settings/categories/page.tsx: CRUD table for categories (create, rename, soft-delete/deprecate — do not hard-delete a category that has existing articles attached; instead mark it deprecated and hide it from the Author's publish-time category selector while leaving existing articles unaffected).

5. admin/page.tsx: a simple overview dashboard with a few real stat tiles (total users, total published articles, open moderation reports count, total ledger revenue this month) — keep this functional and on-theme but not over-engineered; this is not the animation/polish pass.

Every admin action must be restricted to role=admin server-side, not just hidden in the UI.
```

**Manual Task:** You will need to manually promote your own test user to `role="admin"` directly in Drizzle Studio the first time, since there is no self-service admin signup (per spec, Admin is an internal-only role) — open Drizzle Studio, find your user row in the `users` table, change `role` to `admin`, save.

**Testing:** As the promoted admin user, log in, visit `/dashboard/admin`. Suspend a test Author account and confirm their articles disappear from the public site immediately. Report a test article as a Reader, then as Admin find it in the moderation queue and Dismiss it, then report another and Unpublish it, confirming it disappears from public view. Edit the fee config, change the standalone split to 70/30, save, and confirm a NEW test purchase uses 70/30 while an OLD ledger entry from Step 8's testing still shows 80/20 (unchanged).

---

## Step 12 — Frontend Article Editor (Medium-Style)

**Purpose:** Replaces the basic Step 4 form with the polished, minimal writing experience the client specifically referenced via a Medium demo video.
**Depends on:** Step 4 (article CRUD data model), Step 8 (Premium toggle logic).

**Agent Task:**
```text
IMPORTANT: Before writing any editor code, read docs/02_ThemeGuideline.md's note on the editor, then confirm the target UX one of two ways: (a) if a Medium demo video/screen recording is available in Refrence/, ask the user (me) to confirm the understanding below against it since you cannot watch video directly, or (b) if no video is available or the user prefers, go read/experience Medium's own live writing editor directly (e.g. by describing what you'd check at medium.com's "write a story" flow, or asking the user to quickly check it themselves) — either path is fine, just do not skip straight to building without one of these two confirmations:

"I understand the target editor UX to be: minimal chrome (no heavy toolbar bar always visible), a large serif reading-width column (not full browser width) for comfortable writing, an inline floating formatting toolbar that appears only when text is selected (offering bold/italic/heading/link/quote at minimum), and a clean drag-or-click image embed flow that inserts images inline within the reading column rather than in a separate sidebar uploader. Is this correct, or does the reference show something meaningfully different — e.g. a persistent top toolbar, different formatting options, or a different image embed interaction?"

Wait for my confirmation or correction before proceeding. Also read docs/07_ComponentArchitectureAndStandards.md before building — EditorCanvas and FloatingToolbar are new one-off editor components (per docs/03_FolderStructure.md's src/components/editor/ folder), but they must still compose the existing shared Button/Input primitives rather than reimplementing them. Once confirmed, build:

1. Replace the Step 4 article editor form's body field with a proper rich-text editor (use Tiptap, which is the most reliable headless React rich-text editor for this exact "Medium-style" pattern — install @tiptap/react, @tiptap/starter-kit, @tiptap/extension-image, @tiptap/extension-link, @tiptap/extension-placeholder).
2. Build src/components/editor/EditorCanvas.tsx: large serif (Fraunces for headings typed inline, Inter for body per docs/02_ThemeGuideline.md) reading-width column (max ~720px), minimal chrome — just a title input at the top (large, serif, placeholder "Article title...") and the Tiptap content area below with a placeholder "Tell your story...".
3. Build src/components/editor/FloatingToolbar.tsx: a small pill-shaped toolbar (per docs/02_ThemeGuideline.md's flat, editorial component style) that appears via Tiptap's BubbleMenu extension only when text is selected, offering Bold, Italic, H2, H3, Link, Blockquote at minimum. Animate its appearance with Framer Motion (quick fade+scale, ~120ms).
4. Build image embed: clicking a small "+"/image icon in the editor (or a Tiptap slash-command-style trigger) opens a minimal file picker, uploads the image (same upload approach chosen in Step 4), and inserts it inline in the content flow at the cursor position, full-width within the reading column.
5. Keep the Category select, Tags input, cover image, Publish/Save Draft, and (for AuthorPro users) Premium toggle + price field from Step 4/8, but restyle their container to sit in a slim, unobtrusive sidebar or a bottom "Publish settings" drawer that doesn't clutter the minimal writing canvas — the writing area itself must stay the visual focus, per the Medium reference.
6. Persist Tiptap's content as JSON (matches the articles.body JSON column type from Step 1) and render it back correctly on the public single-article page (Step 5) using Tiptap's read-only render or a JSON-to-HTML renderer — confirm existing published articles from Step 4/5 still render correctly after this change.

This is a fully responsive requirement too — on mobile, the floating toolbar and reading column must remain usable with touch text-selection, not just desktop mouse selection.
```

**Manual Task:** Answer the agent's confirmation question about the Medium editor reference — either check the video/materials in `Refrence/` if one is there, or just open medium.com yourself and try its "write a story" flow for two minutes, then confirm or correct the agent's description above before it proceeds.

**Testing:** Open the article editor, type a title and some body text, select a word — a small floating toolbar appears with formatting options. Apply Bold and a Heading, insert an image inline. Publish. View the article on its public page and confirm formatting and the inline image render correctly. Test on a phone-width browser — selecting text still triggers the floating toolbar usably.

---

## Step 13 — Notifications & Emails for All Flows

**Purpose:** Ensures every flow that should notify a user (invite, purchase, moderation action, OTP, verification) actually does, consistently.
**Depends on:** Steps 2, 8, 9, 11 (the flows being notified about must already exist).

**Agent Task:**
```text
Read docs/01_ApplicationFlow.md in full and cross-check every flow (A through J) for a notification touchpoint.

1. Confirm/complete Resend email templates in src/emails/ for: verify-email.tsx (Step 2.3, done), otp-code.tsx (Step 2.4, done), publication-invite.tsx (Step 9, done) — now add: purchase-receipt.tsx (sent to a Reader after a successful pay-per-article purchase or new subscription, showing what they bought/subscribed to and the amount), moderation-notice.tsx (sent to an Author when their article is unpublished or their account is suspended by Admin, per Step 11, explaining the reason), invite-response-notice.tsx (sent to a Publication Owner when an invited Author accepts or declines).

2. Wire each template to fire at the correct point already built in earlier steps: purchase-receipt after checkout.session.completed (Step 8/10 webhook), moderation-notice after an Admin action (Step 11), invite-response-notice after Accept/Decline (Step 9).

3. Build the in-app notification UI on top of the notifications table (already created in Step 1, already being written to by Step 9's invite flow): a bell icon in the dashboard topbar (src/components/dashboard/DashboardTopbar.tsx from Step 3) showing an unread count badge, and a dropdown listing recent notifications with read/unread state. Ensure notifications rows are now also being written for the events that don't yet write one: moderation actions taken on your content (Step 11), successful AuthorPro upgrade (Step 7). Publication invites received and invite accepted/declined (Owner side) already write rows as of Step 9 — just confirm they surface correctly in this new dropdown UI.

4. Ensure every email template is on-brand per docs/02_ThemeGuideline.md's color/type tokens where email-client-safe (inline styles, web-safe font fallback stack behind Fraunces/Inter, since not all email clients render custom fonts).

Do not create new business logic in this step — only wire notifications to events that already exist from prior steps.
```

**Manual Task:** None, beyond having a working Resend sender address.

**Testing:** Trigger each flow end-to-end as a real test user and confirm both the email arrives (check your inbox) and the in-app bell notification appears where applicable: buy an article (receipt email), get invited to a Publication (invite email + bell notification), get your test article unpublished by Admin (moderation email).

---

## Step 14 — Full Responsive Pass

**Purpose:** A dedicated hardening pass across every screen built so far, since responsiveness was called out as a top priority and individual steps may have drifted.
**Depends on:** Steps 1–13 (everything built so far).

**Agent Task:**
```text
Read docs/02_ThemeGuideline.md Section 7 (Responsive Rules) in full, and Section 8 (Application States) — every state introduced there (page/section loading, skeletons, empty states, offline/slow-network banners, error/retry states, disabled states, success states) must also be re-verified at all three breakpoints as part of this pass, not just static layout.

Systematically audit and fix every page and component built in Steps 3-13 across three breakpoints: mobile (375px width baseline), tablet (768px), desktop (1280px+). For each of the following, confirm and fix as needed against the exact rules in docs/02_ThemeGuideline.md Section 7:
- Navbar (hamburger drawer behavior, icon cluster spacing)
- Homepage hero, thumbnail rail, Editor's Picks module, all card grids
- Content Listing page grid + pagination
- Single article page (reading column width, sidebar behavior, related articles grid)
- Search overlay (input sizing, pill wrapping, results grid)
- Auth modal (split-panel to stacked/simplified collapse on mobile)
- Dashboard shells (author/reader/admin) — sidebar collapsing to a mobile-friendly pattern (bottom nav, drawer, or hamburger — your choice, document which, must remain fully usable one-handed on a phone)
- Article editor (Step 12) — floating toolbar and reading column on touch devices
- Footer (column stacking)
- All forms (signup, article editor sidebar/drawer, admin fee config, billing) — inputs and buttons must never overflow or become unusably small on mobile

Fix any horizontal scroll/overflow bugs, any text truncation that looks broken, any tap targets under 44px on mobile, and any layout that visibly breaks between breakpoints (not just at the exact breakpoint edges — test the ranges between them too). Do not introduce new features in this step — fix only responsive/layout issues.
```

**Manual Task:** None, but it is worth you personally opening the live dev server on your own phone (same WiFi network, using your computer's local IP address) to sanity-check a few key screens once the agent reports this step done.

**Testing:** Using your browser's device toolbar (or a real phone), click through: homepage, content listing, a single article, search overlay, signup/login modal, author dashboard + editor, admin dashboard — at phone width, tablet width, and desktop width. Nothing should require horizontal scrolling, all buttons should be comfortably tappable, and no text should overlap or get cut off unexpectedly.

---

## Step 15 — Full Animation/Motion Polish Pass

**Purpose:** A dedicated pass to layer in the "ultra polished" motion design called out repeatedly as a top priority, since individual feature steps intentionally kept animation minimal to focus on function first.
**Depends on:** Step 14 (responsive layout must be correct before adding motion on top of it).

**Agent Task:**
```text
Read docs/02_ThemeGuideline.md Section 6 (Motion & Animation Guidelines) in full.

Implement the complete motion layer across the app, using the library ownership rules exactly as specified (Framer Motion for component-level, GSAP+ScrollTrigger for scroll-driven/hero/parallax, animate.css only for tiny utility flourishes):

1. Page/route transitions: soft fade + 8px vertical slide (300ms) between route changes using Framer Motion's AnimatePresence at the root layout level.
2. Card hover states: implement the lift + shadow + image zoom on EVERY ArticleCard instance across homepage, content listing, search results, related articles, and publication pages (should already share one ArticleCard component from Step 5 — confirm and add the hover animation there once, centrally).
3. Homepage hero: subtle GSAP ScrollTrigger parallax on the hero image (scrub, ~40px translate range).
4. Scroll-reveal: apply staggered fade+slide-up (GSAP ScrollTrigger, 60-80ms stagger) to every card grid section on the homepage and content listing page as it enters the viewport.
5. Buttons: magnetic hover effect on large hero/paywall CTA buttons specifically (not every button — per the theme doc), plus a universal tap/click scale-down (0.97) on all buttons via Framer Motion.
6. Modal and search overlay: confirm Steps 2 and 6's enter/exit animations match the theme doc's exact timing (scale+fade 200ms/150ms for modal, fade+slide 250ms/150ms for search overlay) — refine if drifted.
7. Skeleton loading states: build skeleton placeholder versions of ArticleCard and the single-article page, shown while data is loading, with a CSS shimmer sweep, crossfading to real content via Framer Motion AnimatePresence once loaded.
8. animate.css utility flourishes ONLY for: shake on a form validation error (signup, login, article editor required fields, admin fee config validation), a small pulse on a new toast notification's icon, a subtle bounce on a success checkmark (e.g. after a successful purchase or publish action).
9. Reduced motion: audit EVERY animation added in this step and confirm each respects prefers-reduced-motion (Framer Motion variants fall back to opacity-only, GSAP ScrollTrigger setups disable transform-based effects and keep simple fades only) — this is not optional polish, it is an accessibility requirement.

Do not change any layout structure in this step — motion only, layered on top of the already-correct responsive layout from Step 14.
```

**Manual Task:** None.

**Testing:** Browse the site broadly — card hovers lift and zoom smoothly, the homepage hero has a subtle parallax as you scroll, card grids fade/stagger into view as you scroll down, the search overlay and auth modal animate in/out smoothly, a deliberately-wrong login attempt shakes the form. Turn on "reduce motion" in your OS accessibility settings, reload, and confirm the site still functions with calmer/simpler transitions rather than broken or jarring animation.

---

## Step 16 — SEO / Performance / Accessibility Pass

**Purpose:** Ensures the public-facing content (the platform's core value) is discoverable, fast, and usable by everyone before launch.
**Depends on:** Step 15.

**Agent Task:**
```text
Perform a dedicated SEO, performance, and accessibility hardening pass across the whole app:

SEO:
1. Add proper generateMetadata() (Next.js App Router metadata API) to every public page (homepage, content listing, category pages, single article, author profile, publication page, search) — dynamic title/description per article/category/author, Open Graph image (use the article's cover image), canonical URL.
2. Add a sitemap.xml (Next.js sitemap.ts) covering all published articles, categories, authors, and publications, and a robots.txt allowing public routes and disallowing /dashboard and /api.
3. Ensure semantic HTML throughout: one <h1> per page, proper heading hierarchy on article pages, <article>, <nav>, <footer> landmark elements used correctly.

Performance:
4. Audit and fix image handling: confirm all images use next/image with correct sizing/priority hints (hero images should be priority, below-fold images lazy), proper width/height to avoid layout shift.
5. Confirm fonts (Fraunces, Inter) are loaded via next/font/google with font-display swap behavior (next/font handles this by default — just confirm no manual @font-face overrides broke it).
6. Run a Lighthouse audit (via Chrome DevTools) against the homepage, content listing, and a single article page in production build mode (npm run build && npm run start, not dev mode) and report the Performance/Accessibility/Best Practices/SEO scores; fix anything scoring below 90 where reasonably possible within this codebase (e.g. unused JS, render-blocking resources, missing alt text).

Accessibility:
7. Confirm every interactive element (buttons, links, form inputs, the modal, search overlay) is keyboard-navigable (Tab/Shift+Tab/Enter/Escape work correctly) and has visible focus states matching the theme doc's focus ring token.
8. Confirm all images have meaningful alt text (article cover images should use the article title at minimum), all form inputs have associated labels (visually hidden if needed, not just placeholder text), and all icon-only buttons (search, hamburger, close) have aria-labels.
9. Confirm color contrast of all text against its background meets WCAG AA (particularly white text on the crimson accent background, and muted text colors from docs/02_ThemeGuideline.md) — adjust token shades slightly if any combination fails, keeping the overall palette intent intact.

Report a summary of the before/after Lighthouse scores and any accessibility fixes made.
```

**Manual Task:** None, though you're welcome to spot-check a couple of pages with Chrome DevTools' Lighthouse tab yourself for peace of mind.

**Testing:** Run a Lighthouse audit on the homepage and a single article page yourself in Chrome DevTools (production build) — confirm scores are reasonably high (90+ ideally) across Performance, Accessibility, Best Practices, and SEO. Tab through the homepage and the auth modal using only your keyboard — you should be able to reach and activate every interactive element with a visible focus indicator at each stop.

---

## Step 17 — Deployment to Vercel Production + Stripe Live Mode Cutover

**Purpose:** Ships the finished platform to a real, public URL with real payments enabled.
**Depends on:** Steps 1–16 all complete and tested.

### 17.1 Deploy to Vercel (Manual Task, with Agent Task support for env var prep)
**Manual Task:**
1. Go to your Vercel dashboard (from Step 0.3), click "Add New... → Project," select your `contributor` GitHub repo, click Import.
2. In the configuration screen, add every environment variable from your `.env.local` (Step 0.8) into Vercel's Environment Variables section for the Production environment — `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (set this to your real production URL, e.g. `https://yourdomain.vercel.app`, once known), `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (you'll update this in 17.2), `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
3. Click Deploy. Wait for the build to finish.
**Testing/Verification:** Vercel shows "Deployment Ready" with a live URL; visiting it shows your homepage exactly as it works locally.

### 17.2 Configure the production Stripe webhook (Manual Task)
1. In Stripe Dashboard (still test mode for now), go to Developers → Webhooks → "Add endpoint."
2. Endpoint URL: `https://your-vercel-url.vercel.app/api/webhooks/stripe`.
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`.
4. Copy the new webhook signing secret shown, update `STRIPE_WEBHOOK_SECRET` in Vercel's environment variables, redeploy (Vercel → Deployments → "..." → Redeploy, or just push any small commit).
**Testing/Verification:** Complete one full test-mode purchase on the live Vercel URL and confirm a ledger row appears (check Drizzle Studio pointed at your Neon production DB) — proves the live webhook endpoint works.

### 17.3 Custom domain + DNS (Manual Task, optional but recommended)
1. In Vercel, go to your project → Settings → Domains, add your purchased domain.
2. Follow Vercel's shown DNS instructions at your domain registrar (usually an A record or CNAME) — this varies by registrar, Vercel's on-screen instructions are accurate for whichever you use.
**Testing/Verification:** Your custom domain loads the live site within DNS propagation time (can take up to 24-48 hours, usually much faster).

### 17.4 Stripe live mode cutover (Manual Task — do this LAST, only once everything above is confirmed working in test mode)
1. In Stripe Dashboard, complete Stripe's account activation requirements (business details, bank account for payouts) under Settings → Account details — Stripe will prompt you through what's required for your country/entity type.
2. Toggle to "Live mode" (top-right in Stripe Dashboard).
3. Go to Developers → API keys (live mode) and copy the NEW live `pk_live_...` and `sk_live_...` keys.
4. Repeat the webhook setup from 17.2 in live mode, getting a new live-mode `whsec_...` secret.
5. Update all four Stripe-related env vars in Vercel to the live-mode values, redeploy.
**Testing/Verification:** Make one small real purchase yourself with a real card (e.g. buy your own $1 test-priced article) and confirm it completes and appears correctly in both Stripe's live dashboard and your production database, then consider refunding it to yourself via Stripe Dashboard if you don't want to keep the charge.

**Agent Task** (run once, before 17.1, to make sure the codebase is deploy-ready):
```text
Do a final pre-deployment check of the whole codebase:
1. Confirm .env.example lists every environment variable the app actually reads from process.env, with a one-line comment each, and that .env.local is correctly gitignored and was never committed.
2. Run a full production build locally (npm run build) and fix any build-time errors or warnings.
3. Confirm the Stripe webhook route handler correctly reads the raw request body (required for signature verification) and will work identically when deployed to Vercel's serverless functions, not just localhost.
4. Confirm no hardcoded localhost URLs remain anywhere (email links, redirect URLs, AUTH_URL usage) — everything should read from an environment variable that will be swapped for the production URL.
5. Report a final checklist confirming all of the above, plus the current git status (clean, all changes committed) ready for me to push and deploy.
```

**Testing:** The full checklist above passes, `npm run build` completes with zero errors, and after 17.1-17.4 you have a live, publicly reachable production site processing real Stripe payments correctly.

---

## Verification & Test-Case Prompts

Run these after Step 17 (or earlier, opportunistically, after Step 13 once most functionality exists) to harden and validate the finished build. Paste each block as-is into Claude Code.

### Test-Case Prompt 1 — Cross-role edge-case & bug hardening

```text
Read docs/00_ScopeDocument.md in full, especially the Role & Permission Matrix (Section 3) and Monetisation rules (Section 5).

Act as a QA engineer trying to break this application through edge cases and permission boundary violations. Systematically test and fix issues in the following areas, testing each as if you were logged in as each of the four roles (Reader, Author, AuthorPro, Admin) where relevant:

1. Attempt every AuthorPro-only action (mark article Premium, create a Publication, invite a contributor) using a free-tier Author account, both through the UI (confirm the control is hidden/disabled) AND by directly calling the underlying API route/Server Action with a crafted request (confirm it's rejected server-side with an appropriate error, not silently succeeding).
2. Attempt every Admin-only action (suspend a user, edit fee config, action a moderation report, manage categories) using a non-admin account via direct API calls.
3. Test what happens when an AuthorPro subscription expires/lapses while the user has existing Premium articles and an existing Publication — confirm existing content stays live but new Premium/Publication creation is correctly blocked, per docs/00_ScopeDocument.md Section 3's resolved assumption.
4. Test joint authorship: confirm a jointly-authored article can NEVER be marked Premium, even if you attempt it via direct API manipulation with one co-author being AuthorPro.
5. Test the Publication supersede logic: subscribe to a Publication, then subscribe to Platform, then try to subscribe to that same Publication again — confirm the correct state (already covered) is communicated, not a duplicate active subscription.
6. Test revenue split math with edge-case amounts (e.g. a $0.99 pay-per-article price where cents don't divide evenly across the 60/20/20 split) — confirm no cents are lost or duplicated, and document your rounding rule if not already documented from Step 8/10.
7. Test article report/moderation: report the same article twice from two different Reader accounts, confirm both reports appear in the admin queue distinctly, and confirm actioning one doesn't silently resolve the other incorrectly.
8. Test session/auth edge cases: expired session accessing a protected route, a suspended user attempting to log in, an unverified Author attempting to bypass the OTP step via a direct route visit.

For each issue found, fix it, and give me a final report listing every issue found and how it was fixed.
```

### Test-Case Prompt 2 — Responsive & cross-device QA

```text
Read docs/02_ThemeGuideline.md Section 7 (Responsive Rules) in full.

Perform a rigorous responsive/cross-device QA pass across the entire application, testing at minimum these viewport widths: 320px (small phone), 375px (standard phone), 768px (tablet portrait), 1024px (tablet landscape/small laptop), 1440px (desktop), 1920px (large desktop).

For every major page and component (homepage, content listing, category pages, single article, search overlay, auth modal, author dashboard + article editor, reader dashboard, admin dashboard, footer, navbar), check for and fix:
1. Any horizontal overflow/scroll that shouldn't exist.
2. Any tap target smaller than 44x44px on touch viewports.
3. Any text that overlaps, gets cut off, or becomes illegibly small.
4. Any image that doesn't scale/crop correctly at its breakpoint.
5. Any modal or overlay (auth modal, search overlay, toast notifications) that renders off-screen or unusably on small viewports.
6. Any component that doesn't match the specific collapse/stack behavior defined in docs/02_ThemeGuideline.md Section 7's table (navbar hamburger, hero stacking, card grid column counts, footer column stacking).
7. Confirm the Medium-style article editor's floating toolbar (Step 12) works correctly with touch-based text selection on a tablet-width viewport, not just mouse selection.

Fix every issue found and give me a final report of what was found and fixed, organized by page.
```

### Test-Case Prompt 3 — Performance & accessibility audit

```text
Perform a final performance and accessibility audit of the production build (run npm run build && npm run start, do not audit the dev server).

1. Run a Lighthouse audit (Performance, Accessibility, Best Practices, SEO) against: the homepage, the content listing page, a single Premium article page (both locked and unlocked states), and the search overlay. Report all four scores for each.
2. For any score below 90, identify the specific cause (e.g. largest contentful paint from an unoptimized hero image, cumulative layout shift from a missing image dimension, missing alt text, insufficient color contrast, missing form labels) and fix it.
3. Specifically re-verify color contrast for white text on the crimson accent background and all muted/secondary text colors from docs/02_ThemeGuideline.md Section 2 against WCAG AA (4.5:1 for normal text, 3:1 for large text) — adjust token shades slightly if needed while preserving the overall brand palette intent, and note any token value you changed.
4. Confirm every animation added in Step 15 correctly respects prefers-reduced-motion by testing with that OS setting enabled — nothing should break or become unusable, only calmer.
5. Confirm keyboard-only navigation works fully through: the auth modal (open, fill form, submit, close), the search overlay (open, type, select a result, close), the article editor's publish flow, and the admin moderation queue's action buttons.

Report final before/after scores and a list of every fix made.
```

### Scope Completeness Audit Prompt

```text
Re-read docs/00_ScopeDocument.md in its entirety, section by section. Then thoroughly review the actual codebase (not just your memory of building it) to verify every rule, role, permission, number, and workflow in that document is correctly and completely implemented.

Produce a checklist report with one line per item from docs/00_ScopeDocument.md, marked ✅ Implemented correctly, ⚠️ Implemented but with an issue (describe it), or ❌ Missing entirely. Cover at minimum:

- Every row of the Role & Permission Matrix (Section 3) — spot-check the actual enforcement code, not just the presence of a UI control.
- Every row of the Content Model (Section 4).
- The exact revenue split percentages and their correct application to standalone vs in-publication Premium articles (Section 5.1) — check the current platformConfig seed/values and the calculateAndRecordSplit logic.
- The pooled Platform-subscription distribution logic and its "qualifying read" definition (Section 5.2).
- The ledger's completeness (Section 5.3) — every purchase and every subscription-period distribution should have a corresponding ledger row with correct sums.
- Every row of the Subscription Structure table (Section 6), including the Publication-superseded-by-Platform rule.
- Joint authorship always being free (Section 7.1).
- Publication creation restricted to AuthorPro only, and the invite/accept/decline workflow (Section 7.2).
- Every Admin capability (Section 8).
- Every third-party service actually wired to the correct real tool (Section 9).
- Every one of the 5 Key User Flows (Section 10) working end-to-end.
- Every Out-of-Scope item (Section 11) confirmed as NOT built (flag it if something out-of-scope was accidentally implemented).
- The Comments feature (Section 4 "Comments" note): flat non-threaded comments, visible identically on free and Premium articles, delete restricted to comment-owner or Admin, soft-deleted (never hard-deleted).

Do not mark anything ✅ without having actually located and read the relevant code — do not assume something is correct because it was requested in an earlier prompt.
```

### Whole App Flow Prompt

```text
Read docs/01_ApplicationFlow.md in full. For each of the ten flows (A through J), manually walk the live application step-by-step exactly as described in that document, using real test accounts for each required role (create new ones if needed, or reuse existing test accounts from earlier steps).

For each flow, report:
- Flow letter and name.
- Each numbered step from the doc, and whether it worked exactly as described (✅), worked but with a rough edge (⚠️, describe it), or broke (❌, describe exactly what happened and where).
- For flows with a mermaid diagram showing branching (e.g. Flow B's paywall choice branches, Flow H's three admin actions, Flow J's supersede logic), confirm EVERY branch was individually tested, not just the first/happy path.

At the end, give me a single combined pass/fail summary table (10 rows, one per flow) and fix any ❌ or ⚠️ items found before reporting this step complete.
```
