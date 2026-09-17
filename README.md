# Contributor

Contributor is a content publishing platform. Authors write and publish articles; Readers browse and read them. On top of that, the platform has a monetization layer:

- Authors can upgrade to **AuthorPro** to paywall ("Premium") their articles and form **Publications** (multi-author collections, like a digital magazine).
- Readers can pay per article, subscribe to a single Publication, or subscribe to the whole platform for unlimited access.
- The platform takes a percentage cut of Premium revenue, split between the author, the Publication owner (if any), and the platform itself.
- A **Platform Admin** role manages users, categories, platform fees, and content moderation.

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui, Framer Motion / GSAP for animation
- **Database:** Neon (serverless Postgres) via Drizzle ORM
- **Auth:** Auth.js (NextAuth v5), with email + OTP-based 2FA for Authors and Admins
- **Payments:** Stripe (Checkout + webhooks) for purchases and subscriptions
- **Email:** Gmail SMTP via Nodemailer (login/verification codes, receipts, moderation notices)
- **Editor:** Tiptap for the article-writing experience

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

It covers the Neon database URL, Auth.js secret, Stripe keys, and Gmail SMTP credentials (see the comments in that file for where each one comes from). One extra variable used for local QA, not listed there:

```bash
# Optional. Lets test accounts ending in @contributor.local skip the
# real emailed OTP code during manual testing. Never set to "true" in
# a real deployment.
ALLOW_TEST_OTP_BYPASS=false
```

### 3. Set up the database

```bash
npm run db:migrate            # apply migrations
npm run db:seed-categories    # seed the fixed category list
npm run db:seed               # seed default platform fee/split config
```

Optionally, seed sample editorial articles/authors for local dev/demo data:

```bash
npx tsx drizzle/seed-editorial-articles.ts
```

To create the first Platform Admin account (Admin isn't self-registerable by design):

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=your-password ADMIN_NAME="Your Name" npm run db:seed-admin
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Stripe webhooks locally

To receive Stripe events during local development, forward them with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the webhook signing secret it prints as `STRIPE_WEBHOOK_SECRET`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `npm run db:seed` | Seed default platform fee/revenue-split config |
| `npm run db:seed-categories` | Seed the fixed category list |
| `npm run db:seed-admin` | Create a Platform Admin account (see above) |

## Project structure

```
contributor/
├── drizzle/            # Schema (drizzle/schema), migrations, seed scripts
├── src/
│   ├── app/             # Next.js App Router routes
│   │   ├── (marketing)/    # Public, unauthenticated pages (homepage, articles, search, etc.)
│   │   ├── (dashboard)/    # Reader / Author / Admin dashboards
│   │   ├── (auth)/         # Sign-up, email verification, OTP
│   │   └── api/            # Route handlers (checkout, webhooks, search, etc.)
│   ├── components/      # Shared and feature-specific React components
│   ├── lib/              # Server actions, queries, permissions, business logic
│   └── emails/           # React Email templates
```

## Deployment

This project deploys to [Vercel](https://vercel.com). Set the environment variables above in the Vercel project settings, and point `AUTH_URL` and the Stripe webhook endpoint at your production domain. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for general guidance.
