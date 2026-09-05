# 06 — Project State (Live Tracker — Agent Updates This File)

> **What this file is for:** this is the single source of truth for *where the build actually is right now* — which steps are done, what got decided along the way, and what to do next. It exists so the project can be picked up by a different Claude Code session, a different model, or a different day with zero lost context — no re-reading the whole chat history, no re-deriving decisions, no accidentally re-doing or skipping a step.
>
> **Rule for the coding agent:** at the end of every step or sub-step in `04_MasterBuildGuide.md` — right before you report that step complete to the user — you MUST update this file: flip the step's status, fill in its "What was actually done / decided" line, note any deviation from the guide (and why), and update the "Current Position" block at the top. Do this even if the step's Testing checklist hasn't been confirmed by the user yet — mark it `🔄 Built, awaiting user test` rather than `✅ Done` until the user confirms it passed. Never skip this update, and never let this file fall behind actual git history — if you're unsure whether a step is really done, check the codebase, don't guess from memory.
>
> **What `✅ Done` means now:** per `04_MasterBuildGuide.md`'s "How to use this document" 4-phase loop (Build → Test → Bug-Find & Gap-Find → Fix & Re-test), a step is only `✅ Done` after phase 4 completes clean — passing the Testing checklist alone (phase 2) is not enough to mark it Done. If a step has passed its Testing checklist but the Bug-Find & Gap-Find pass hasn't happened yet, keep it at `🔄 Built, awaiting user test` and note in that row that phase 3/4 are still outstanding.
>
> **Rule for a brand-new agent session (different model, new chat, resumed later):** before doing anything else, read this file in full. Resume exactly from the step marked `▶️ Next up`. Do not restart, redo, or "improve" a step already marked `✅ Done` unless the user explicitly asks you to revisit it — treat completed steps as trustworthy, verified ground truth. If a step is marked `🔄 Built, awaiting user test`, ask the user whether it passed testing before moving on, rather than assuming.

---

## Current Position

- **Status:** Not started.
- **Next up:** Step 0.1 (GitHub account + new repository).
- **Last updated by:** — (fill in agent/session identifier + date on first update)
- **Tech stack lock-in (must match `00_ScopeDocument.md` §12 — do not deviate without updating that doc too):** Next.js App Router + TypeScript, Tailwind CSS, shadcn/ui, Framer Motion + GSAP/ScrollTrigger + animate.css, Neon Postgres + Drizzle ORM, Auth.js (NextAuth v5), Stripe, Resend, Vercel.
- **Component reuse/coding standards:** governed by `07_ComponentArchitectureAndStandards.md` — re-read it before building or extending any shared component (Navbar, Footer, ArticleCard, AuthModal, SearchOverlay, dashboard shell, application-state components, etc.).

---

## Key Decisions Log

> Append one row every time a step asks the agent to choose between documented options (e.g. "your choice, document which you used"), or confirms something with the user (e.g. the refined color palette, the Medium editor understanding). This is what lets a new agent avoid re-asking questions that are already answered.

| Step | Decision point | Resolution | Confirmed by user? |
|---|---|---|---|
| — | — | — | — |

*(No decisions logged yet — this table fills in as steps complete.)*

---

## Step-by-Step Status

> Status values: `⬜ Not started` / `🔄 Built, awaiting user test` / `✅ Done` / `⚠️ Done with known issue` (explain in notes) / `⏭️ Skipped` (explain why — should be rare, this build is sequence-dependent).

### Step 0 — Accounts & Environment Setup

| Sub-step | Status | What was actually done / decided | Notes / deviations |
|---|---|---|---|
| 0.1 GitHub account + repo | ⬜ Not started | | |
| 0.2 Node.js, Git, code editor | ⬜ Not started | | |
| 0.3 Vercel account | ⬜ Not started | | |
| 0.4 Neon account + project | ⬜ Not started | | |
| 0.5 Stripe account + keys + Connect | ⬜ Not started | | |
| 0.5 (continued) Project scaffold | ⬜ Not started | | |
| 0.6 Resend account + API key | ⬜ Not started | | |
| 0.7 Auth.js secret | ⬜ Not started | | |
| 0.8 `.env.local` + Vercel env vars | ⬜ Not started | | |
| 0.9 Claude Code / agent setup | ⬜ Not started | | |

### Steps 1–17

| Step | Status | What was actually done / decided | Notes / deviations |
|---|---|---|---|
| 1 — DB Schema & Drizzle Setup | ⬜ Not started | | |
| 2.1 Auth.js config + Drizzle adapter | ⬜ Not started | | |
| 2.2 Signup flow + auth modal | ⬜ Not started | | |
| 2.3 Email verification | ⬜ Not started | | |
| 2.4 OTP-based 2FA | ⬜ Not started | | |
| 2.5 Login flow wiring | ⬜ Not started | | |
| 2.6 Role-based route protection | ⬜ Not started | | |
| 3 — Core Layout Shell (Navbar/Footer/Tokens) | ⬜ Not started | | *(Palette confirmation happens here — log the final chosen hex values in the Decisions Log above once confirmed.)* |
| 4 — Article CRUD (Free Author) | ⬜ Not started | | *(Log which image-upload approach was chosen — Vercel Blob vs. base64 — in the Decisions Log.)* |
| 5 — Homepage + Content Listing + Single Article + Comments + Report | ⬜ Not started | | |
| 6 — Search | ⬜ Not started | | |
| 7 — AuthorPro Upgrade + Stripe Billing | ⬜ Not started | | *(Log Stripe Product/Price sync approach chosen.)* |
| 8 — Premium/Paywall + Pay-Per-Article Checkout | ⬜ Not started | | *(Log the rounding-remainder rule used for split math.)* |
| 9 — Publications (Create/Invite/Accept/Decline) | ⬜ Not started | | |
| 10 — Reader Subscriptions + Pooled Revenue Ledger | ⬜ Not started | | *(Log the Publication-subscription pooling approach used — confirmed as Publication-scoped pooling per the guide.)* |
| 11 — Admin Dashboard | ⬜ Not started | | |
| 12 — Frontend Article Editor (Medium-Style) | ⬜ Not started | | *(Log the user's confirmation of the Medium editor UX understanding here — required before this step can be marked Done.)* |
| 13 — Notifications & Emails | ⬜ Not started | | |
| 14 — Full Responsive Pass | ⬜ Not started | | *(Log which mobile dashboard-sidebar pattern was chosen — drawer/bottom-nav/hamburger.)* |
| 15 — Full Animation/Motion Polish Pass | ⬜ Not started | | |
| 16 — SEO / Performance / Accessibility Pass | ⬜ Not started | | *(Log before/after Lighthouse scores.)* |
| 17.1 Deploy to Vercel | ⬜ Not started | | |
| 17.2 Production Stripe webhook | ⬜ Not started | | |
| 17.3 Custom domain + DNS | ⬜ Not started | | |
| 17.4 Stripe live mode cutover | ⬜ Not started | | |

### Verification & Test-Case Prompts (run after Step 17, or opportunistically after Step 13)

| Prompt | Status | Summary of findings | Notes |
|---|---|---|---|
| Test-Case Prompt 1 — Cross-role edge-case & bug hardening | ⬜ Not run | | |
| Test-Case Prompt 2 — Responsive & cross-device QA | ⬜ Not run | | |
| Test-Case Prompt 3 — Performance & accessibility audit | ⬜ Not run | | |
| Scope Completeness Audit Prompt | ⬜ Not run | | |
| Whole App Flow Prompt | ⬜ Not run | | |

---

## Known Issues / Open Items

> Anything flagged `⚠️` above, or any bug found and deferred rather than fixed immediately, gets logged here with enough detail for a future agent to pick up without re-investigating from scratch.

*(None yet.)*

---

## How to Update This File (for the agent)

At the end of any step/sub-step:
1. Change its row's Status column.
2. Fill in "What was actually done / decided" — 1-2 plain sentences, e.g. "Created all 15 tables + seeded platformConfig with 80/20/60/20/20 defaults, migrations ran clean against Neon."
3. If you deviated from the guide's exact instructions for a documented reason, note it in "Notes / deviations" — don't silently diverge.
4. If a sub-step involved a "your choice, document which" decision or a required user confirmation, add a row to the **Key Decisions Log**.
5. Update **Current Position** at the top: flip "Next up" to the next step, update "Last updated by" with today's date and a short session identifier.
6. If you found and fixed a bug outside the current step's direct scope, or deferred one, log it in **Known Issues / Open Items**.
