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

(Appended as sections complete — see PASS entries below.)
