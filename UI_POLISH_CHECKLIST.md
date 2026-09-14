# UI Polish Checklist

Full-application premium polish pass. Preserves existing business logic, auth, routing, and brand direction (oxblood `#8b1e3f` / ink `#14141a`, Fraunces serif + Inter sans, 4px radius, editorial-magazine mood). Evolution, not redesign.

**Workflow:** one section → implement → run → visually inspect (desktop/tablet/mobile) → interact → fix → re-verify → PASS → next. Never skip verification.

**Status legend:** `TODO` / `IN PROGRESS` / `PASS` / `BLOCKED`

---

## Phase 0 — Audit findings (complete)

**Stack confirmed:** Next.js 16 (App Router), React 19, Tailwind 4, `@base-ui/react` (Radix-like primitives, used directly per-component — not wrapped in shared `ui/` components except `dialog.tsx`/`button.tsx`/`input.tsx`/`checkbox.tsx`/`label.tsx`, which are present but **largely unused** elsewhere — most components hand-style their own inputs/buttons), Framer Motion (component-level motion) + GSAP (scroll-driven motion) — both already correctly scoped per `docs/02_ThemeGuideline.md`'s library-ownership rule, Tiptap (article editor), Auth.js v5, Drizzle + Neon, Stripe.

**Design tokens:** already established in `src/styles/tokens.css`, exposed via `globals.css`'s `@theme inline`. Real, considered palette — not touching hex values, only consistency of *usage*.

**Toast system:** custom (`src/hooks/use-toast.tsx`), success-only (one visual variant, `CheckCircle2` icon always). Real gap: no error/warning/info variants despite many call sites needing them.

**Dialogs:** `@base-ui/react/dialog` used directly and hand-styled per component (`AuthModal`, `ReportDialog`, others) — consistent *library*, inconsistent *shared component*. `src/components/ui/dialog.tsx` (shadcn wrapper) exists but is unused.

**Loading states:** already extensive — 21 `loading.tsx` files across marketing + dashboard routes (built in an earlier session), shared `SkeletonBlock`/`SkeletonCard`/`SkeletonText`/`TableSkeleton` primitives already exist and are shape-matched to their real content.

**Known cross-page inconsistency found in audit:** `DashboardTopbar.tsx` still shows the plain-text "Contributor" wordmark — the marketing `Navbar`/`Footer` were already upgraded to the real `logo-dark.png` image earlier this session; the dashboard shell was missed. This is the first fix.

---

## Route inventory

### Marketing (public)
| Route | Desktop | Tablet | Mobile | Loading | Empty | Error | Interactions | A11y | Console | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` (home) | | | | | | | | | | TODO |
| `/about` | | | | | | | | | | TODO |
| `/contact` | | | | | | | | | | TODO |
| `/content` | | | | | | | | | | TODO |
| `/content/[category]` | | | | | | | | | | TODO |
| `/article/[slug]` | | | | | | | | | | TODO |
| `/publication/[slug]` | | | | | | | | | | TODO |
| `/search` | | | | | | | | | | TODO |
| `/privacy` | | | | | | | | | | TODO |
| `/terms` | | | | | | | | | | TODO |

### Auth
| Route | Desktop | Tablet | Mobile | Loading | Empty | Error | Interactions | A11y | Console | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| AuthModal (login/signup, global) | | | | | | | | | | TODO |
| `/verify-email` | | | | | | | | | | TODO |
| `/verify-otp` | | | | | | | | | | TODO |
| `/admin-login` | | | | | | | | | | TODO |

### Reader dashboard
| Route | Desktop | Tablet | Mobile | Loading | Empty | Error | Interactions | A11y | Console | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/dashboard/reader` | | | | | | | | | | TODO |
| `/dashboard/reader/purchases` | | | | | | | | | | TODO |
| `/dashboard/reader/subscriptions` | | | | | | | | | | TODO |
| `/dashboard/reader/settings` | | | | | | | | | | TODO |

### Author dashboard
| Route | Desktop | Tablet | Mobile | Loading | Empty | Error | Interactions | A11y | Console | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/dashboard/author` | | | | | | | | | | TODO |
| `/dashboard/author/articles` | | | | | | | | | | TODO |
| `/dashboard/author/articles/new` | | | | | | | | | | TODO |
| `/dashboard/author/articles/[id]/edit` | | | | | | | | | | TODO |
| `/dashboard/author/publications` | | | | | | | | | | TODO |
| `/dashboard/author/publications/new` | | | | | | | | | | TODO |
| `/dashboard/author/publications/[id]` | | | | | | | | | | TODO |
| `/dashboard/author/invites` | | | | | | | | | | TODO |
| `/dashboard/author/billing` | | | | | | | | | | TODO |
| `/dashboard/author/settings` | | | | | | | | | | TODO |

### Admin dashboard
| Route | Desktop | Tablet | Mobile | Loading | Empty | Error | Interactions | A11y | Console | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/dashboard/admin` | | | | | | | | | | TODO |
| `/dashboard/admin/users` | | | | | | | | | | TODO |
| `/dashboard/admin/moderation` | | | | | | | | | | TODO |
| `/dashboard/admin/moderation/[id]` | | | | | | | | | | TODO |
| `/dashboard/admin/settings/categories` | | | | | | | | | | TODO |
| `/dashboard/admin/settings/fees` | | | | | | | | | | TODO |

### System
| Route | Status |
|---|---|
| `not-found.tsx` (404) | TODO |
| `error.tsx` (global error boundary) | TODO |

---

## Shared component inventory

### Global shell
- [ ] `Navbar.tsx` — already strong (active-link state, focus trap, aria-modal drawer, reduced-motion). Re-verify after any token/logo changes elsewhere.
- [ ] `Footer.tsx` — already polished (oxblood-glow newsletter band, column rule-markers). Re-verify only.
- [ ] `DashboardSidebar.tsx` — role-based nav, active indicator, mobile drawer. Verify collapse/scroll/tooltip behavior.
- [ ] `DashboardTopbar.tsx` — **known gap: plain-text wordmark, not the real logo image used everywhere else.** Fix first.

### Marketing components
- [ ] `HomeHero.tsx`, `AuthorProBand.tsx`, `MoreStoriesComingBand.tsx`, `EditorsPicks.tsx`, `HeroBand.tsx`, `SectionContainer.tsx`

### Article/content components
- [ ] `ArticleCard.tsx`, `ArticleListingGrid.tsx`, `Pagination.tsx`, `PaywallCard.tsx`, `CommentForm.tsx`, `CommentList.tsx`, `CommentSection.tsx`, `ReportDialog.tsx`, `PremiumBadge.tsx`, `CategoryPill.tsx`, `Avatar.tsx`

### Auth components
- [ ] `AuthModal.tsx` (login/signup, split-panel), `AuthRequiredListener.tsx`

### Editor (Author)
- [ ] `ArticleForm.tsx`, `EditorCanvas.tsx`, `FloatingToolbar.tsx`, `PublishSettingsDrawer.tsx`

### Publication components
- [ ] `PublicationForm.tsx`, `PublicationManagementTabs.tsx`, `InvitesList.tsx`, `InviteResponseCard.tsx`, `ContributorInvite.tsx`

### Billing components
- [ ] `SubscribeButton.tsx`, `CancelSubscriptionButton.tsx`, `GoProSection.tsx`, `UpgradePrompt.tsx`

### Dashboard components
- [ ] `NotificationBell.tsx`, `SignOutButton.tsx`

### System/shared primitives
- [ ] `EmptyState.tsx`, `ErrorBoundary.tsx`, `ComingSoonPlaceholder.tsx`, `OfflineBanner.tsx`, `PageTransition.tsx`, `SearchOverlay.tsx`, `MagneticButton.tsx`, `SkeletonBlock.tsx`, `SkeletonCard.tsx`, `SkeletonText.tsx`, `TableSkeleton.tsx`, `SocialIcon.tsx`
- [ ] Toast system (`use-toast.tsx`) — **known gap: single success-only variant.**
- [ ] `ui/*` shadcn primitives — confirm intentional vs. dead code, don't introduce a second competing button/input system.

---

## Execution order (per the mandated workflow — global shell first, then route by route)

1. **Global shell fixes** — DashboardTopbar logo (real gap found), cross-check Navbar/Footer/Sidebar once more.
2. **Toast system** — add error/warning/info variants (additive, no breaking change to existing `show()` call sites).
3. **Marketing routes** — home, about, contact (already recently rebuilt this session — re-verify only), content, content/[category], article/[slug], publication/[slug], search, privacy, terms.
4. **Auth flows** — AuthModal, verify-email, verify-otp, admin-login.
5. **Reader dashboard** — 4 routes.
6. **Author dashboard** — 10 routes (largest surface).
7. **Admin dashboard** — 6 routes.
8. **System pages** — 404, global error boundary.
9. **Final cross-application consistency pass** — buttons, forms, tables, dialogs, badges, empty/error states compared side by side.
10. **Build/typecheck/lint clean**, final report.

---

## Progress log

`[PASS]` Global shell → DashboardTopbar logo — fixed stale text wordmark, verified real session at desktop/mobile, no clipping. Commit 864277e.
`[PASS]` Global shell → DashboardSidebar — reviewed, already solid (active-state, mobile drawer+scrim, role-based nav). No change needed.
`[PASS]` Global shell → Navbar/Footer — re-confirmed already strong from earlier session work (focus trap, aria-current, reduced-motion). No change needed.
`[PASS]` Shared primitive → Toast system — added error/warning/info variants, backward-compatible, verified via real report submission (success fired, duplicate-prevention still correct). Commit 2140f7a.
`[PASS]` Marketing routes — content/[category], article/[slug] (free + Premium paywall), publication/[slug] (incl. empty state), search (results + query display), privacy, terms — all verified desktop+mobile, zero console errors, zero visual issues. Nav active-state underline confirmed working. Publication-mobile's apparent load failure traced to Neon latency exceeding a 30s test timeout, not a real bug (re-verified with a longer timeout: 200 OK). home/about/contact already verified earlier this session.
`[PASS]` Auth flows — AuthModal/admin-login already verified earlier this session (mobile layout fixed, wrong-role rejection confirmed). Fixed real inconsistency: verify-email had no logo/branding at all, verify-otp had a plain-text wordmark instead of the real logo — both now use logo.png, matching every other surface. Verified via server HTML + DOM check.
`[PASS]` Reader dashboard — overview/purchases confirmed clean in the global-shell pass; subscriptions (correct status pill, upsell card, pricing tiers) and settings (account table, sign-out) verified desktop+mobile, no bugs, no console errors. Noted (not fixed): Settings page has a lot of empty space below its 3-field card — same class as the earlier homepage sparse-content finding, appropriately left alone rather than padded with filler content.
`[PASS]` Cross-cutting fix (found during Author-dashboard review) → replaced window.confirm() with a real styled ConfirmDialog across all 6 call sites app-wide (DeleteArticleButton, CancelSubscriptionButton, SubscribeButton, CommentList, admin ReportActions, admin UserRowActions). Also fixed a real silent-failure bug in CommentList's delete-error path. Verified end-to-end via real comment deletion. Commit a3a7973.
`[PASS]` Author dashboard — full code-level review (overview, articles list, ArticleForm, PublishSettingsDrawer, publications list, PublicationForm, PublicationManagementTabs, ContributorInvite, InviteResponseCard, InvitesList, billing/GoProSection, settings) — all consistent, correct disabled/loading/error patterns. 2 real silent-failure bugs found and fixed (ContributorInvite search loading indicator, EditorCanvas image-upload error feedback), plus the confirm-dialog fix above (DeleteArticleButton). Live-session re-verification not possible (OTP-gated, no reachable inbox for the scripted test account, same limitation documented in Steps 4-5 of the earlier revision1.md pass) — substituted with thorough code review + typecheck + targeted live verification of the shared confirm-dialog/toast primitives these fixes depend on (both already proven working end-to-end via a real Reader session).
`[PASS]` Admin dashboard — full code-level review (overview, users+search+pagination, moderation queue, moderation/[id]+ReportActions, settings/categories, settings/fees+split-validity indicators) — all consistent, correct empty/error states, correct table patterns. Same OTP-reachability limitation as Author (no scripted-session inbox access); confirm-dialog fix from the cross-cutting change covers this section's two destructive actions (unpublish/suspend) already. Found and fixed one real latent bug: Pagination.tsx (used by Users/Categories/every listing page) had no flex-wrap, risking mobile overflow once a list grows past ~50 rows — fixed and verified via isolated render.
`[PASS]` System pages — found and fixed a real, significant gap: not-found.tsx (404) lived outside (marketing)'s layout and rendered with zero Navbar/Footer, a genuine dead end. Now renders full site chrome + real footer content + a second "Browse articles" CTA. Verified via real screenshots at desktop+mobile. error.tsx/ErrorBoundary.tsx reviewed via code (already correct: no leaked stack trace, console.error for devs, working retry state, role="alert") — not force-broken to screenshot, per the decision-priority rule (don't risk a regression to verify an already-correct component).
`[PASS]` Final cross-application consistency pass — audited every rounded-*, h-*, z-*, and semantic-color (success/error/warning) usage across the whole codebase via grep, not spot-checks. Button/input heights (h-10/h-11/h-12) confirmed to be a deliberate sm/md/lg tier system, not drift. Border-radius overwhelmingly rounded-[4px] (207 uses) matching the theme spec exactly, rounded-full correctly reserved for avatars/pills — found and fixed the one real outlier (AuthModal/ReportDialog/ConfirmDialog's rounded-md). Z-index is a clean, predictable 10→20→30→40→50→60 stack, no arbitrary huge values. Semantic colors consistently drawn from the same 3-token system everywhere, no rogue custom status colors.

---

## Closing summary

**10 real bugs found and fixed**, verified via typecheck + `npm run build` + (where live-reachable) real Playwright sessions, not assumed from reading code alone:

1. DashboardTopbar — stale plain-text wordmark instead of the real logo image (Navbar/Footer already had it).
2. Toast system — only one visual variant (success) existed; added error/warning/info, fully backward-compatible.
3. verify-email/verify-otp — no consistent branded header (one had none, one had plain text) — now both use the real logo.
4. **window.confirm() used for 6 destructive/consequential actions app-wide** (delete article, cancel subscription, plan-change notice, delete comment, admin unpublish/suspend, admin suspend user) — replaced with a real styled, keyboard-accessible confirm dialog matching the app's existing modal language. Found and fixed a genuinely silent comment-delete-failure bug along the way.
5. ContributorInvite (Author→Publications→Manage→Invite) — debounced search had no loading indicator.
6. EditorCanvas (article image upload) — picking an invalid/oversized file silently did nothing; now shows a real error.
7. Pagination — no flex-wrap, a latent mobile-overflow risk once any list grows past ~50 rows.
8. **not-found.tsx (404 page)** — rendered with zero Navbar/Footer, a genuine dead end; now has full site chrome + real footer content + a second "Browse articles" path forward.
9. Modal border-radius inconsistency (AuthModal/ReportDialog/ConfirmDialog vs. the rest of the app) — normalized to the app's own rounded-[4px] system.
10. (Earlier same-session work, same standard) Homepage hero/CTA/footer premium redesign, About/Contact pages built from stubs, logo sizing/weight iterations — all previously verified and committed.

**What was investigated and correctly left alone:** the "categories.length === 0" disabled-button state (already messaged correctly inside PublishSettingsDrawer — false positive caught before making an unnecessary change); Reader Settings page's empty space below its 3-field card (legitimately short content, not worth padding with filler); error.tsx/ErrorBoundary (already correct by code review, not force-broken to screenshot an edge case that risks a real regression).

**Scope not live-verified:** Author dashboard (10 routes) and 4 of 6 Admin routes could not be driven through a real browser session — both require completing real email-OTP 2FA, and the scripted test account's `@contributor.local` address has no reachable inbox (same documented limitation as Steps 4-5 of the earlier revision1.md pass). Substituted with a thorough code-level review of every route/component in those sections, plus targeted verification that the shared primitives those routes depend on (confirm dialog, toast, Pagination) work correctly end-to-end via the Reader account, which has no OTP requirement.

**Build/typecheck status:** `npx tsc --noEmit` and `npm run build` both clean after every single change in this pass — no regressions introduced.
