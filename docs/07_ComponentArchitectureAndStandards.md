# 07 — Component Architecture & Coding Standards

> **What this file is for:** `00_ScopeDocument.md` defines *what* to build, `02_ThemeGuideline.md` defines *how it should look*, `03_FolderStructure.md` defines *where code lives*. This file defines *how code gets written* — the engineering discipline (reuse, typing, boundaries, validation, testing-at-the-component-level) that keeps the codebase consistent as it grows across 17 build steps and possibly multiple agent sessions/models. It sits alongside those three as a fourth "how we build" reference — it does not restate or override scope, visuals, or folder placement; where this file says "see 03_FolderStructure.md" that document remains the authority on file location and naming.

---

## 1. Reusable Component Doctrine (non-negotiable)

**Rule:** Every shared UI element is built exactly once, in the location `03_FolderStructure.md` already assigns it, and imported everywhere it's needed. No page, dashboard, or feature folder may contain a second implementation of something that already exists in `src/components/shared/`, `src/components/ui/`, or a feature's own already-established component.

This applies specifically to (names below are the exact ones already defined in `03_FolderStructure.md` — reuse them, do not rename or fork them):

- **Navbar** (`src/components/shared/Navbar.tsx`) — the public marketing navbar.
- **Footer** (`src/components/shared/Footer.tsx`).
- **AuthModal** (`src/components/shared/AuthModal.tsx`) — the one split-panel login/signup modal (both modes live in this one component per `02_ThemeGuideline.md` Section 5 — never build a second modal for "just the login part").
- **SearchOverlay** (`src/components/shared/SearchOverlay.tsx`).
- **ArticleCard** (`src/components/shared/ArticleCard.tsx`) — used on the homepage, Content Listing, search results, related-articles, and Publication pages. One component, driven by props, not five near-identical card components.
- **Avatar, CategoryPill, TagPill, PremiumBadge, Pagination, Toast** (`src/components/shared/`).
- **Buttons, Inputs, Dialog, and other primitives** (`src/components/ui/`) — the shadcn/ui layer, themed once per `02_ThemeGuideline.md`, never re-styled ad hoc inside a feature folder.
- **DashboardSidebar, DashboardTopbar, StatCard** (`src/components/dashboard/`) — the authenticated shell chrome shared across Author, Reader, and Admin dashboards.
- **Layout wrappers** — `src/app/(marketing)/layout.tsx`, `src/app/(dashboard)/layout.tsx` as established in `03_FolderStructure.md`. A new route group must compose one of these, never hand-roll its own `<nav>`/`<footer>` markup.
- **Loading / empty / error state components** — `SkeletonCard`, `SkeletonText`/`SkeletonBlock`, `EmptyState`, `OfflineBanner`, `ErrorBoundary` (retry is a built-in prop/slot on `ErrorBoundary` and `OfflineBanner`, not a separate component — see `02_ThemeGuideline.md` Section 8 "Application States" for the visual spec of each, and the small addition to `03_FolderStructure.md`'s `src/components/shared/` listing for their file locations).
- **Section containers** — any recurring "section with eyebrow + heading + content" wrapper used across the homepage/listing pages must be one `SectionContainer`-style component, not copy-pasted markup per section.
- **Typography** — heading/body/caption styling comes from the Tailwind tokens wired in Step 3 (`02_ThemeGuideline.md` Section 3), applied via shared utility classes or a thin `Heading`/`Text` component if the team finds itself repeating the same class string more than twice — never a one-off inline style that drifts from the type scale.

### Concrete anti-pattern to avoid

**Do not** build a second navbar inside the admin dashboard "because the admin one needs different links." The correct approaches, in order of preference:
1. Extend/compose the existing `Navbar` with props (e.g. `variant="dashboard"` or a `links` override) if the visual shell is genuinely the same chrome.
2. If the dashboard genuinely needs a structurally different top bar (as it does per `03_FolderStructure.md` — dashboards use `DashboardTopbar`, not `Navbar`), that variant must be the one documented, canonical `DashboardTopbar` component in `src/components/dashboard/`, built once in Step 3 and reused by every dashboard role (author/reader/admin) — never a third, admin-specific copy-pasted top bar built later in Step 11.

The same rule applies to `ArticleCard`: if the admin's article table needs a denser row-style presentation, that is a distinct, intentionally-named component (e.g. `ArticleTableRow` in `src/components/admin/`) — not a modified copy of `ArticleCard`, and not a re-implementation of `ArticleCard`'s card layout with slightly different JSX.

**Before writing any new component, search the codebase for an existing one that already does the job or could be extended with a prop.** If you find yourself about to paste and lightly modify an existing component's JSX into a new file, stop — extend the original with a variant/prop instead.

---

## 2. Coding Standards

### TypeScript strictness
- `tsconfig.json` keeps `strict: true` (the Next.js scaffold default) — never loosen this.
- No `any` except at a genuinely untyped third-party boundary (and even then, prefer `unknown` + a narrowing check). If a Drizzle query result or Stripe webhook payload needs a type, derive it from Drizzle's inferred types (`typeof articles.$inferSelect`) or Stripe's own SDK types — do not hand-write a parallel interface that can drift out of sync.
- Every exported function has an explicit return type when it isn't trivially inferred (Server Actions, `lib/` helpers especially — a `revenue-split.ts` function's return shape must be explicit given how much other code depends on its correctness).

### Component prop-typing conventions
- Every component's props are a named `interface ComponentNameProps { ... }` (not an inline anonymous type), even for a single-prop component — this keeps prop shapes greppable and easy to extend later without a diff-noisy refactor.
- Optional props use `?:`, never a default value silently baked into a wide union type.
- Shared components that render different variants (e.g. `Button`'s primary/secondary/ghost/danger from `02_ThemeGuideline.md` Section 2) use a `variant` prop typed as a string literal union, not a boolean per variant.

### Server vs. client component boundaries (Next.js App Router)
- **Default to Server Components.** Only add `"use client"` when a component genuinely needs one of: browser-only APIs (`window`, `navigator.onLine`, `localStorage`), React state/effects, event handlers, or a third-party library that requires the client runtime (Framer Motion, Tiptap, GSAP-driven DOM refs).
- Push `"use client"` as far down the tree as possible — a page or layout should stay a Server Component that renders a small client "island" (e.g. the interactive part of a form, a hover-animated card) rather than marking the whole page client-side because one button needs an `onClick`.
- Data fetching for a page's initial render happens in the Server Component (`async function Page()` reading directly from `src/lib/db.ts`), not via a client-side `useEffect` + `fetch`. A client component that needs live/interactive data after the initial load (e.g. the notification bell's unread count polling) is the one legitimate place for client-side fetching.
- Anything touching `auth()`, role checks (`src/lib/permissions.ts`), or Drizzle queries directly must run server-side — never fetch that data through a client component calling a public API route just to avoid a server component.

### Data-fetching conventions
- **Server Components / Server Actions are the default** for both reads and writes, per the pattern already used throughout `04_MasterBuildGuide.md`'s Agent Task prompts (e.g. Step 4's article CRUD, Step 2.2's signup Server Action).
- API Route Handlers (`src/app/api/**`) are reserved for cases that structurally require them: the Stripe webhook (must read a raw body and verify a signature), anything called from a client-side effect that needs a stable REST-ish endpoint (debounced search in Step 6, the notification bell's poll), and third-party callback URLs. Do not build a Route Handler for something a Server Action could do just out of habit.
- Client-side `fetch` is reserved for the narrow cases above — never used as the default way to load a page's initial content.

### Error boundary usage
- A route-segment `error.tsx` exists for every top-level route group (`(marketing)`, `(dashboard)`) at minimum, rendering the `ErrorBoundary`/full-page error state defined in `02_ThemeGuideline.md` Section 8, with a retry action.
- Component-level try/catch belongs in Server Actions and `lib/` functions that can fail in an expected way (a Stripe call, a webhook signature check) — return a typed result (`{ success: false, error: "..." }`) rather than throwing across a Server Action boundary where the caller can't recover gracefully.

### Form validation conventions
- **zod + react-hook-form**, exactly as already chosen in `04_MasterBuildGuide.md`'s Step 0.5 scaffold and used from Step 2.2 onward — this is the only form/validation stack in the project. Never introduce Formik, Yup, or a hand-rolled validation function "just for this one form."
- Every form's zod schema lives in `src/lib/validators/<domain>.ts` per `03_FolderStructure.md` (e.g. `article.ts`, `publication.ts`, `auth.ts`, `admin.ts`) and is imported by both the client-side form (via `@hookform/resolvers/zod`) and the corresponding Server Action, so client and server validation can never drift out of sync — validate once, reuse the schema on both sides.
- Field-level error display follows `02_ThemeGuideline.md`'s input error state spec (border + helper text in `--color-error`) — see also Section 8's general error-state pattern for the toast/full-page cases.

---

## 3. Testing Standards

`04_MasterBuildGuide.md`'s per-step "Testing" sections define what to test at the **page/flow level** for that specific step's feature. This section defines the **standard those checks are built on** — the baseline every component and every step's testing must satisfy, so "tested" means the same thing throughout the whole build.

### Component-level "tested" means:
1. **Renders correctly at all three responsive tiers** (mobile ~375px, tablet ~768px, desktop ~1280px+) per `02_ThemeGuideline.md` Section 7 — not just "doesn't crash," but matches the layout/collapse behavior specified for that component.
2. **Handles its own loading/empty/error sub-states**, where applicable, per `02_ThemeGuideline.md` Section 8 — e.g. `ArticleCard` has a skeleton counterpart, a list-rendering component (My Articles, admin tables, search results) has a defined empty state, any component that fetches its own data has a defined error/retry sub-state. A component that never fetches data and has no meaningful empty state (e.g. `Avatar`) is exempt — this requirement applies where a loading/empty/error condition can actually occur.
3. **Keyboard accessible** — reachable via Tab, operable via Enter/Space (or Escape for dismissal, where relevant), with a visible focus state per `02_ThemeGuideline.md`'s focus ring token. This applies to every interactive component (buttons, links, form inputs, modal/overlay triggers and their internal focus trap, pagination, pill buttons) — not just page-level "can I tab through the whole page" checks (those still happen at the flow level, per Step 16 and Test-Case Prompt 3).

### Page/flow-level testing
Stays exactly as defined in each step's existing "Testing" section in `04_MasterBuildGuide.md` — this document does not replace or duplicate those checklists. The relationship is: a step's Testing checklist verifies the *feature* works end-to-end; the component-level standard above is what each *piece* of that feature must already satisfy on its own before it's assembled into the flow. If a component fails its own standard (e.g. no keyboard access, no responsive collapse), fixing it is part of that step's Bug-Find & Gap-Find phase (see `04_MasterBuildGuide.md`'s "How to use this document" section for the 4-phase build/test/bugfind-gapfind/retest loop), not a separate testing track.

---

## 4. Cross-references

- **`00_ScopeDocument.md`** — remains the authority on *what* to build (roles, permissions, revenue rules, content model). This file never overrides it.
- **`02_ThemeGuideline.md`** — remains the authority on *visual spec* (colors, type, spacing, motion, responsive rules, and Section 8's Application States visual treatment). This file is the *engineering/reuse discipline* layer — it tells you not to duplicate a component and how to write it, `02_ThemeGuideline.md` tells you what it should look like when you do.
- **`03_FolderStructure.md`** — remains the authority on *where* a file lives and its naming convention. This file assumes and reuses those exact paths/names throughout.
- **`04_MasterBuildGuide.md`** — every Agent Task prompt that builds or touches a shared/reusable component should re-read this file's Section 1 before writing code, exactly as it already re-reads `00`, `02`, and `01` for scope/visual/flow rules.
