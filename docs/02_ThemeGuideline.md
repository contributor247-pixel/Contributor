# 02 — Theme Guideline (Visual Design System)

> **MANDATORY INSTRUCTION FOR THE CODING AGENT:** The reference screenshots in `Refrence/` — `home_ref.png`, `content_lis.png`, `single_art.png`, `about (2).png`, `login.png`, `search.png` — are a **layout and structure reference, not a final visual spec**. If you are ever unsure what *content, sections, or interaction pattern* a screen needs, open and inspect these screenshots before inventing a new pattern — page composition, component structure, and information hierarchy should closely follow them. **Color is the one dimension you should NOT copy verbatim from the screenshots.** The color table in Section 2 below is a starting palette only; apply real color theory (proper contrast ratios, a more considered accent-to-neutral balance, better harmony between the accent and the ink/neutral ramp) to arrive at a genuinely better combination than a literal eyedropper-match of the screenshots — see Section 2's instructions for how. If a layout pattern is genuinely not covered by these screenshots, ask the user to confirm the direction before deviating. Never fall back to generic default shadcn/ui styling or a generic SaaS-template look — every component below has explicit customization instructions specifically to avoid that.

This design system is derived from the "Wikilogy" reference theme screenshots for **layout and structure**, then **elevated** in execution — the goal is "ultra polished, premium, editorial magazine" quality, not a 1:1 clone. Treat the screenshots as structural/layout inspiration (page sections, card composition, modal/overlay patterns, grid rhythm) — **not** as the final color authority. The tokens below, especially colors, are a refined starting point the agent should improve on using sound color theory, not a literal match to extract.

---

## 1. Brand Personality / Mood

Confident, editorial, intellectual, premium magazine — the digital equivalent of a well-art-directed print publication (think a hybrid of a New Yorker-style masthead confidence and a modern digital-native magazine like The Verge or Vulture). Black-and-white photography-forward, one bold accent color used sparingly but decisively, generous whitespace between dense content modules, serif display type for authority, clean sans body type for readability. It should never feel like a generic SaaS dashboard or an AI-template landing page — no soft pastel gradients, no floating 3D blobs, no default rounded-everything look.

---

## 2. Color System

> **How to use this section:** the values below are a **reference starting point** derived loosely from the screenshots' color *feel* (near-black header/nav, one bold warm accent, white/off-white content background) — not values to color-pick pixel-for-pixel from the PNGs. Before finalizing, the coding agent should:
> 1. Keep the *structure* of the palette (one dark neutral "ink," one bold accent used sparingly, a warm-neutral background, a muted text ramp) — this structure is what makes the editorial-magazine mood work, and should stay.
> 2. Re-derive the actual hues/values using color theory rather than the literal hex codes below: pick an accent with genuinely strong contrast against both the ink and the background (check WCAG AA at minimum, aim for AAA on large text), keep the neutral ramp (ink/border/muted-text) in the same hue family (avoid muddy near-black-but-slightly-blue vs near-black-but-slightly-brown clashes), and consider a slightly more refined/less primary-red accent than a stock crimson if it reads as more premium (e.g. a deeper wine, burnt vermillion, or oxblood can feel less "corporate alert red" while keeping the same boldness) — the agent has creative latitude here, this is a place to make a genuinely better combination, not just replicate the reference.
> 3. Whatever palette is chosen, it must satisfy the same *usage rules* in the table below (which token does which job) — only the actual hex/oklch values are open to improvement, not which token is used where.
> 4. Confirm the final palette with the user (a quick before/after swatch comparison) before it's locked into `tailwind.config.ts` in Step 3 of `04_MasterBuildGuide.md`, since this is a visible, hard-to-cheaply-undo decision.

| Token | Value (hex) — starting point, may be refined per above | Usage |
|---|---|---|
| `--color-primary` | `#C8102E` | Crimson accent — CTAs, active nav states, section eyebrow labels, numbered list markers (Editor's Picks), price/premium badges, hero band on Content Listing page |
| `--color-primary-hover` | `#A50D26` | Hover/active state of primary buttons and links |
| `--color-primary-subtle` | `#FBE8EA` | Light tint background for primary badges/pills on white surfaces |
| `--color-ink` | `#111114` | Near-black — header/nav background, footer background, primary heading text |
| `--color-ink-soft` | `#1C1C21` | Secondary dark surface (footer column backgrounds, dark cards) |
| `--color-bg` | `#FFFFFF` | Page background (light mode default) |
| `--color-bg-muted` | `#F7F6F4` | Section alternate background, card grid background bands |
| `--color-surface` | `#FFFFFF` | Card / modal surface |
| `--color-border` | `#E7E5E1` | Default hairline borders, card dividers |
| `--color-border-strong` | `#D3D0CA` | Input borders, table borders |
| `--color-text-heading` | `#111114` | Headline text |
| `--color-text-body` | `#3A3A3E` | Body copy |
| `--color-text-muted` | `#7B7A7F` | Byline/meta text, timestamps, captions |
| `--color-text-inverse` | `#FFFFFF` | Text on dark surfaces (nav, footer, hero overlays) |
| `--color-link` | `#111114` | Default inline link (underline on hover) |
| `--color-link-hover` | `#C8102E` | Link hover color |
| `--color-success` | `#1E8E5A` | Success toasts/badges |
| `--color-warning` | `#B8860B` | Warning toasts/badges |
| `--color-error` | `#D93025` | Error states, form validation |
| `--color-overlay-scrim` | `rgba(10,10,12,0.72)` | Modal/search-overlay backdrop |
| **Dark mode (optional, Phase 1 nice-to-have, not required for launch):** | | |
| `--color-bg-dark` | `#0B0B0D` | Page background in dark mode |
| `--color-surface-dark` | `#17171A` | Card surface in dark mode |
| `--color-text-heading-dark` | `#F5F4F2` | Heading text in dark mode |
| `--color-text-body-dark` | `#C7C6C3` | Body text in dark mode |

### Button color states

| Variant | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| Primary | bg `--color-ink`, text white | bg `--color-primary`, text white | bg `--color-primary-hover` | bg `#C9C9C9`, text `#8A8A8A` |
| Secondary (outline) | border `--color-ink`, text `--color-ink`, transparent bg | bg `--color-ink`, text white | bg `#000` | border `#D3D0CA`, text `#B0AFAA` |
| Ghost | transparent, text `--color-ink` | bg `--color-bg-muted` | bg `--color-border` | text `#B0AFAA` |
| Danger (admin actions) | bg `--color-error`, text white | darken 10% | darken 15% | bg `#F3C6C2` |

Note: on this theme, **Primary CTA buttons are actually rendered in ink-black by default with red reserved for accents/highlights** — exactly as seen in `login.png`'s black "Sign in" button and `content_lis.png`'s red hero band text. Use `--color-primary` (red) for the *few, decisive* moments: hero band backgrounds, "Editor's Picks" numerals, premium/lock badges, active tab underlines, and section eyebrow text — not for every button. This restraint is what makes the accent feel premium instead of overused.

Card background: `--color-surface`. Card hover state: lift `translateY(-4px)`, shadow `0 12px 24px rgba(0,0,0,0.08)`, image slight `scale(1.03)` zoom (see Motion section).

---

## 3. Typography System

**Font pairing recommendation** (pick one pair, apply consistently; load via `next/font/google`):
1. **Display/serif headline:** "Fraunces" (recommended primary — high-contrast editorial serif, great for large headlines) — alternative: "Playfair Display" or "Source Serif 4".
2. **Body sans:** "Inter" (recommended primary — clean, highly legible at small sizes) — alternative: "Public Sans" or "Manrope".

### Type scale

| Style | Mobile size/line/tracking | Desktop size/line/tracking | Weight | Font |
|---|---|---|---|---|
| H1 (hero headline) | 32px / 1.15 / -0.01em | 56px / 1.1 / -0.015em | 600 | Fraunces |
| H2 (section title) | 26px / 1.2 / -0.01em | 38px / 1.15 / -0.01em | 600 | Fraunces |
| H3 (card/article title) | 20px / 1.3 / normal | 24px / 1.3 / normal | 600 | Fraunces |
| H4 | 18px / 1.35 | 20px / 1.35 | 600 | Fraunces |
| H5 | 16px / 1.4 | 17px / 1.4 | 600 | Inter |
| H6 / overline label | 12px / 1.4 / 0.08em uppercase | 13px / 1.4 / 0.08em uppercase | 700 | Inter |
| Body-lg (article reading body) | 17px / 1.7 | 19px / 1.8 | 400 | Inter |
| Body (default UI text) | 15px / 1.6 | 16px / 1.6 | 400 | Inter |
| Body-sm | 13px / 1.5 | 14px / 1.5 | 400 | Inter |
| Caption/byline/meta | 12px / 1.4 | 13px / 1.4 | 500 | Inter |
| Button text | 14px / 1 / 0.01em | 15px / 1 / 0.01em | 600 | Inter |

Byline pattern (used on every article card, per `home_ref.png` and `content_lis.png`): small circular avatar (28px mobile / 32px desktop) + "Created by" muted overline + author name in medium-weight text, timestamp + category separated by a muted "for"/bullet, exactly as shown in the reference screenshots.

---

## 4. Spacing & Layout System

- **Base spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 — expose as Tailwind spacing tokens `1,2,3,4,6,8,12,16,24,32`.
- **Container max-widths:** mobile `100%` w/ 16px gutter, `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1152px content max-width (matches the reference's centered ~1200px layout), `2xl` 1320px.
- **Grid system:** 12-column CSS grid at `lg`+, collapsing to a single flexible column stack below `md`.
- **Card grid patterns:**
  - 3-column magazine grid (`content_lis.png`) — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap 32px desktop / 20px mobile.
  - Featured hero span — hero article spans full width or 2/3 width with a sidebar list beside it (`home_ref.png` top hero + right-side numbered thumbnail rail).
  - Editor's Picks module — large featured story left (spans ~7/12 cols) + numbered 01–04 list right (~5/12 cols), exactly as in `home_ref.png`.
- **Section vertical rhythm:** 64px between major homepage sections on mobile, 96–128px on desktop; 24–32px between a section's header and its content grid.

---

## 5. Component Style Specs

### Buttons
- Sizes: `sm` (32px h), `md` (40px h, default), `lg` (48px h, used for hero/paywall CTAs).
- Radius: `4px` (sharp, editorial — NOT the default shadcn `rounded-md` pill-ish look; override the shadcn button radius token).
- Primary/Secondary/Ghost/Danger states as defined in Section 2.
- Icon buttons (search, cart/purchase, login, hamburger in nav) are 40px square, ghost style, icon from `lucide-react`.

### Input fields
- Height 48px, `1px solid --color-border-strong`, radius `4px`, padding `12px 16px`, placeholder in `--color-text-muted`.
- Focus state: border `--color-ink`, subtle ring `0 0 0 3px rgba(17,17,20,0.08)`.
- Error state: border `--color-error`, helper text in `--color-error` below field.
- Matches the flat, boxy, unrounded input style seen in `login.png`.

### Article card
Structure (top→bottom), matching `home_ref.png` / `content_lis.png` cards exactly:
1. Cover image (16:10 ratio), rounded `4px`, overflow-hidden, hover zoom `scale(1.03)`.
2. Eyebrow row: timestamp (muted, e.g. "2 years Ago") + " for " + Category (linked, hover→primary color).
3. Title (H3, Fraunces, 2-line clamp).
4. Excerpt (Body-sm, muted, 2-line clamp) — shown on listing/grid cards, omitted on dense homepage rail cards.
5. Byline row: avatar + "Created by" + author name.
6. If Premium: small lock badge (see Badges below) pinned top-left corner of the cover image.

### Navbar
Matches `home_ref.png` / `about (2).png`: black background (`--color-ink`), logo left ("Contributor" wordmark — client-confirmed brand name, same wordmark-style treatment as the "Wikilogy" reference but with our actual name), center/left nav links (Homepage, Wiki/Content Listing, Create Content, About, Contact), right-side icon cluster (cart/purchases, login/account, search trigger), hamburger menu icon far-left on mobile. Sticky on scroll with a subtle background-blur + shadow once scrolled. Mobile: nav links collapse into a slide-in drawer triggered by the hamburger; icon cluster stays visible.

### Footer
Matches `home_ref.png` / `content_lis.png`: full-width black (`--color-ink`) section. Top band: "Get Inside the hustle" newsletter signup (headline + email input + submit arrow button + terms checkbox). Below: 4-column layout (Company blurb, Latest Contents list w/ thumbnails, Featured cover, Suggestions Contents list w/ thumbnails) collapsing to a stacked single column on mobile. Bottom bar: wordmark, copyright, legal links, social icons.

### Modal / Dialog — Auth modal (layout/structure from `login.png` must be replicated precisely; colors follow the refined palette from Section 2, not a literal match to the screenshot)
Split-panel modal, centered, max-width ~1050px, overlay scrim `--color-overlay-scrim` behind it, close (X) icon top-right.
- **Left panel (dark):** full-bleed background image (moody/atmospheric photo), dark gradient overlay for text legibility, "Create Account" headline (white, Fraunces), supporting copy, white "Sign Up" button that flips the modal to the signup form.
- **Right panel (white):** "Sign in to Contributor" headline (Fraunces), Username/Email input, Password input, "Remember Me" checkbox, full-width black "Sign in" button, "Lost Your Password?" + "Create Account" text links below.
- Modal enter: scale-in + fade (0.98→1, 200ms, ease-out) with backdrop fade. Exit: reverse, 150ms.
- Both signup and login states live in the same modal component, toggled by the CTA on the dark panel (do not build separate modals).

### Search overlay (layout/structure from `search.png` must be replicated precisely; colors follow the refined palette from Section 2, not a literal match to the screenshot)
Full-screen (or near-full-screen, 90vh) overlay triggered by the nav search icon.
- Centered giant input, placeholder "Type here to search...", minimal underline/box styling, huge font size (~40px+), autofocus on open.
- Below input: row of "popular keyword" pill buttons (outline style, e.g. History / World / Animal / Elegant / Education) — clicking a pill fills the query and triggers search.
- Below that: live results rendered as the standard 3-col article card grid, updating as the user types (debounced ~300ms).
- Overlay enter: fade + slight slide-down of content, 250ms ease-out. Exit on close icon, outside click, or `Esc`: fade out 150ms.

### Badges / Pills
- Category pill: `--color-primary-subtle` bg, `--color-primary` text, radius `4px`, uppercase, 11px, used as the eyebrow label style variant on hero bands.
- Tag pill: outline style, `--color-border-strong` border, `--color-text-body` text, radius `999px` (tags are the one intentionally pill-rounded element, to visually distinguish free-form tags from fixed categories).
- Premium/lock badge: small black rounded-square badge with a lock icon (`lucide-react` Lock), positioned top-left of card thumbnails and inline before the price on paywall CTAs.

### Paywall / lock UI treatment
Article body renders normally for ~2–3 paragraphs, then a vertical gradient fade-to-white mask (`from-transparent to-white`, ~200px tall) overlays the remaining (still-rendered-but-obscured) text, with a centered card on top: lock icon, "This is a Premium article" heading, the three access-choice buttons (Buy / Subscribe to Publication / Subscribe to Platform) per Flow B in `01_ApplicationFlow.md`.

### Avatar
Circular, default 32px (28px in dense card bylines, 40px on author profile header, 96px on public author bio page). Fallback: initials on a muted background if no image.

### Pagination
Numbered pill buttons matching `content_lis.png` (1 2 3 … 6, "NEXT" text link), active page in `--color-primary` filled circle, inactive pages ghost/muted.

### Toast / notification
Bottom-right stack, white surface, left accent bar colored by type (`--color-success` / `--color-error` / `--color-warning`), auto-dismiss 4s, slide-in from right + fade.

---

## 6. Motion & Animation Guidelines

**Library ownership:**
- **Framer Motion** — component-level: card hover/lift, modal enter/exit, search overlay enter/exit, button micro-interactions (magnetic hover, tap scale), page/route transition fades, skeleton-to-content crossfade, `AnimatePresence` for all mount/unmount transitions.
- **GSAP + ScrollTrigger** — scroll-driven and complex sequences: hero image parallax on the homepage, scroll-reveal stagger for card grid sections entering viewport, pinned/scrubbed sections if used on the About page, the Editor's Picks numbered-list reveal.
- **animate.css** — tiny utility flourishes ONLY: form-field shake on validation error, a pulse on a newly-added toast icon, a subtle bounce on a success checkmark. Never used for primary layout motion.

**What must animate:**
- Page/route transitions: soft fade + 8px vertical slide, 300ms.
- Card hover: lift `-4px` + shadow grow + image `scale(1.03)`, 220ms ease-out.
- Hero image: subtle parallax on scroll (GSAP ScrollTrigger, `scrub: true`, translateY range ~40px).
- Scroll-reveal: card grids fade+slide-up on entering viewport, staggered 60–80ms per item, `ScrollTrigger` with `start: "top 85%"`.
- Buttons: magnetic hover (slight translate toward cursor within a small radius) on large CTA buttons only (hero/paywall), scale `0.97` on tap/click.
- Modal & search overlay: scale/fade enter+exit as specified in Section 5.
- Skeleton loading states: shimmer animation (CSS gradient sweep) while article/card data is loading, crossfade to real content via Framer Motion `AnimatePresence`.

**Easing/duration standards:** default ease `cubic-bezier(0.22, 1, 0.36, 1)` ("ease-out-expo"-ish) for entrances, `cubic-bezier(0.4, 0, 1, 1)` for exits. Durations: micro-interactions 120–200ms, component transitions 200–350ms, scroll-driven/hero motion tied to scroll position (no fixed duration).

**Accessibility fallback (required):** every animation must respect `prefers-reduced-motion: reduce` — wrap Framer Motion variants to fall back to opacity-only transitions, and wrap GSAP ScrollTrigger setups in a check that disables transform-based scroll effects (keep simple fades only) when reduced motion is requested.

---

## 7. Responsive Rules

Breakpoints (Tailwind defaults): `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px. Mobile-first: build the base (unprefixed) styles for mobile, layer up with `sm:`/`md:`/`lg:` etc.

| Element | Mobile (<640px) | Tablet (640–1024px) | Desktop (1024px+) |
|---|---|---|---|
| Navbar | Hamburger drawer, logo centered/left, icon cluster visible | Hamburger drawer still, more breathing room | Full horizontal nav links visible, no hamburger |
| Hero | Single column, image behind/below headline, headline ~32px | 2-column starts to emerge at `md` | Full 2-column hero w/ side thumbnail rail, headline 56px |
| Card grids | 1 column | 2 columns | 3 columns (magazine grid) |
| Editor's Picks module | Stacked: featured story, then numbered list below | Same stacked, wider | Side-by-side 7/12 + 5/12 split |
| Article reading view | Full-width column, 16px gutter, no sidebar | Centered column ~640px, sidebar may appear at `lg` | Centered reading column ~720px + right sidebar (related/author bio) |
| Footer | Single stacked column, newsletter full-width | 2-column | Full 4-column layout |
| Search overlay | Full-screen, stacked pill buttons wrap to multiple rows | Same, wider input | Centered, generous whitespace either side |
| Auth modal | Left dark panel hidden or stacked above form (single column) | Split-panel begins at `md` | Full split-panel side-by-side |

Every "Agent Task" build step in `04_MasterBuildGuide.md` that touches UI must implement all three tiers above — mobile is the baseline, not an afterthought.

---

## 8. Application States

> These states must be treated as first-class UI, not an afterthought bolted on at the end. Every visual treatment below reuses the color/spacing/motion tokens already defined in Sections 2, 4, and 6 of this document — no new ad-hoc colors are introduced here. Each state names the component that owns it, per `03_FolderStructure.md`'s component folders (a small addition to that file's `src/components/shared/` listing accompanies this section for the 2-3 components that don't already exist there). Engineering/reuse discipline for these components (don't duplicate one per page) is covered in `07_ComponentArchitectureAndStandards.md` — this section is the visual spec only.

### 8.1 Page-level loading (initial route load)
**Trigger:** A Server Component page is fetching its initial data (e.g. navigating to `/content` or `/article/[slug]`).
**Visual:** Next.js `loading.tsx` per route segment, rendering the relevant skeleton layout (see 8.3) full-height so there is no blank white flash — background `--color-bg`, skeleton blocks in place of the real content's actual grid/column structure.
**Owning component:** route-level `loading.tsx` files (one per route segment in `src/app/(marketing)/**` and `src/app/(dashboard)/**`), composing the shared skeleton components from 8.3.

### 8.2 Section-level loading
**Trigger:** A specific section or widget is still fetching while the rest of the page has already rendered (e.g. a dashboard `StatCard` tile whose count hasn't resolved yet, or a "related articles" block at the bottom of an article).
**Visual:** Only that section shows a skeleton/spinner treatment (per 8.3) — everything already loaded around it stays static and interactive. `StatCard` in its loading sub-state shows a shimmer block in place of its number, same card chrome (border, radius, padding) as the resolved state so nothing visually jumps.
**Owning component:** the section/widget component itself owns its own loading sub-state (e.g. `StatCard` from `src/components/dashboard/`) — per `07_ComponentArchitectureAndStandards.md`'s component-testing standard, this is one of the sub-states each self-fetching component must handle.

### 8.3 Skeleton loading
**Cross-reference:** Section 6 (Motion & Animation Guidelines) already specifies the shimmer crossfade behavior ("Skeleton loading states: shimmer animation (CSS gradient sweep) while article/card data is loading, crossfade to real content via Framer Motion `AnimatePresence`"). This subsection expands that into a concrete visual spec:
- **Shimmer gradient:** a `linear-gradient(90deg, --color-bg-muted 0%, --color-border 50%, --color-bg-muted 100%)` band, animated left→right, ~1.5s duration, `ease-in-out`, infinite loop, respecting `prefers-reduced-motion` (fall back to a static `--color-bg-muted` block with no sweep animation).
- **Shape-matching rule:** a skeleton's shape must mirror the real content's layout, not a generic gray box. Concretely:
  - `ArticleCard` skeleton: a 16:10 image-shaped block (matching the real cover image's aspect ratio and `4px` radius), a short eyebrow-width bar, a two-line title-width bar (matching H3's line-height), a byline row with a circular 28px/32px avatar-shaped dot + a name-width bar.
  - Single-article page skeleton: a full-width hero-image-shaped block, a headline-width bar at H1 scale, a byline row (as above), then several body-text-width bars at Body-lg line-height.
  - `StatCard` skeleton: same card chrome as the resolved tile, with a number-width shimmer bar in place of the stat.
- **Owning components:** `SkeletonCard` (mirrors `ArticleCard`) and `SkeletonText`/`SkeletonBlock` (generic shimmer primitives composed into page-specific skeletons like the single-article skeleton) in `src/components/shared/`.

### 8.4 Empty states
**Trigger:** A list/grid query resolves with zero results — "No articles yet," "No search results," "No notifications," "No Publications yet," "No pending invites," empty admin tables (no reports in queue, no users matching a filter), etc.
**Visual:** Centered within the content area, on `--color-bg` or `--color-bg-muted` depending on context: a simple line-art/icon-style illustration (a single `lucide-react` icon at a large size, e.g. 48-64px, in `--color-text-muted`, on-brand rather than a generic emoji or stock illustration), a short headline (H4 weight, `--color-text-heading`), one line of supporting copy (Body-sm, `--color-text-muted`), and — where relevant — a primary CTA button (per Section 2's button spec).
- "No articles yet" (My Articles, empty): headline "You haven't published anything yet," CTA "Write your first article" → links to the article editor.
- "No search results": headline "No results for '{query}'," supporting line "Try a different keyword or browse categories instead," no CTA button (a link back to Content Listing is enough).
- "No notifications": headline "You're all caught up," no CTA.
- "No Publications yet" (AuthorPro with no Publications): headline "Create your first Publication," CTA "New Publication" → links to publication creation (only shown to AuthorPro users per the permission matrix).
- Admin empty tables (e.g. empty moderation queue): headline "Nothing to review right now," no CTA, slightly more compact treatment than the reader-facing empty states above since it sits inside a dashboard table shell.
**Owning component:** `EmptyState` in `src/components/shared/` — a single component taking `icon`, `headline`, `description`, and optional `cta` props, reused for every case above rather than one-off markup per page.

### 8.5 No-internet state
**Trigger:** The browser's `navigator.onLine` reports `false`, or an `offline` event fires (this is a client-rendered, browser-side concern — a small client component mounted once near the root layout).
**Visual:** A persistent, non-dismissable banner pinned to the top of the viewport (below the sticky navbar), full-width, background `--color-warning` at reduced opacity or `--color-ink` with a warning-colored left accent bar (matching the toast pattern's left-accent-bar convention from Section 5), text "You're offline — some features may not work until your connection is restored," `--color-text-inverse`. When the `online` event fires again, the banner briefly switches to a success treatment ("Back online" using `--color-success`, matching the toast success styling) for ~2s, then dismisses itself via the standard toast slide/fade-out motion from Section 6.
**Implementation approach:** a `useEffect` in a small client component registering `window.addEventListener('online'/'offline', ...)` on mount, cleaning up on unmount, driving the banner's visibility via local state — no external library needed for this.
**Owning component:** `OfflineBanner` in `src/components/shared/`, mounted once in the root layout.

### 8.6 Slow-internet state
**Trigger:** A fetch/data operation is taking longer than a perceptible threshold (~2 seconds) to resolve.
**Visual:** Rather than an indefinite bare spinner with no feedback, the loading UI (page-level, section-level, or skeleton per 8.1-8.3) gains a secondary message after the ~2s threshold — small Body-sm text in `--color-text-muted` beneath the primary skeleton/spinner, e.g. "Still loading..." — replacing nothing, just appended, so the user knows the app hasn't frozen. If a further, longer threshold passes (e.g. 8-10s) without resolution, treat it as an error state (8.7) with a retry action rather than continuing to wait silently.
**Implementation approach:** a `setTimeout` guard (e.g. inside a `useSlowLoading(isLoading, thresholdMs)` hook in `src/hooks/`) that flips a boolean after the threshold, shown conditionally alongside the existing skeleton/spinner.
**Owning component:** composed into the same loading component being shown (skeleton or spinner) — not a separate component, just an additional conditional message driven by the hook above.

### 8.7 Error states
**Trigger:** A request fails (network error, server error, validation rejection) or a route segment throws.
**Visual, by scope:**
- **Inline field errors** (form validation) — already specified in Section 5's Input fields spec: border `--color-error`, helper text in `--color-error` below the field. No change here, just confirming this is the field-level instance of the general error pattern.
- **Toast-level errors** — reuses the Toast component from Section 5 (bottom-right stack, white surface, left accent bar in `--color-error`), for a failed action that doesn't warrant leaving the page (e.g. "Couldn't save your comment, please try again").
- **Full-page error boundary** — for a broken route (Next.js `error.tsx`): centered content matching the empty-state layout conventions (icon, headline, supporting copy) but using `--color-error`-tinted icon treatment, headline "Something went wrong," supporting copy "We hit an unexpected error loading this page," and a Retry action button (see 8.8) plus a secondary "Back to homepage" link.
**Owning component:** `ErrorBoundary` (full-page, wraps route-segment `error.tsx` files) in `src/components/shared/`; toast-level and inline errors reuse the existing `Toast` and input error styling already defined — no new component needed for those two.

### 8.8 Retry states
**Trigger:** Pairs with 8.5 (no-internet) and 8.7 (error) — any state where the failed operation can simply be attempted again.
**Visual:** A Secondary (outline) button per Section 2's button spec, label "Try again" or "Retry," placed directly below the error/offline message it belongs to. On click: button enters a brief loading sub-state (spinner replacing the label, button disabled per Section 2's disabled button treatment) while the retry attempt is in flight, then either resolves (content replaces the error state, standard crossfade per Section 6) or re-shows the same error state (so repeated failures don't loop silently — no infinite spinner).
**Owning component:** a `RetryButton` pattern composed into `ErrorBoundary` and `OfflineBanner` directly (not necessarily a separate exported component — a documented prop/slot on those two, e.g. `ErrorBoundary`'s built-in retry action) rather than a bespoke retry button re-implemented per page.

### 8.9 Disabled states
**Cross-reference:** Section 2's button color table already defines the disabled treatment for all four button variants (Primary/Secondary/Ghost/Danger) — that remains the authority for buttons, not duplicated here.
**Additional specs for inputs and cards mid-action:**
- **Disabled input fields:** background `--color-bg-muted`, border `--color-border` (not `--color-border-strong`), text `--color-text-muted`, cursor `not-allowed` — used while a form is submitting (all fields lock during submission, not just the submit button) or for a field that's contextually unavailable (e.g. the Premium price field before the Premium toggle is switched on).
- **Cards mid-action** (e.g. a "Delete" or "Suspend" action in flight on an admin table row, or a purchase button mid-checkout-redirect): the card/row gets `opacity: 0.6` and `pointer-events: none` while the action is in flight, with the acting button itself showing the same spinner-replaces-label treatment described in 8.8, so the user gets clear feedback the click registered without letting them double-submit.

### 8.10 Success states
**Cross-reference:** Section 5's Toast spec already covers the standard success toast pattern (left accent bar `--color-success`, auto-dismiss 4s) — used for lightweight confirmations (comment posted, invite sent, settings saved).
**Additional spec — full-page success states**, for moments significant enough to warrant more than a toast:
- **Post-purchase confirmation:** after a successful article purchase or subscription checkout redirect (Flow B/E/J in `01_ApplicationFlow.md`), a brief full-width success banner or centered confirmation state at the top of the destination page — checkmark icon (`lucide-react` CheckCircle) with the animate.css subtle bounce flourish specified in Section 6, headline confirming what was unlocked (e.g. "Article unlocked" or "AuthorPro is now active"), auto-collapses into the normal page content after ~3-4s or on next interaction rather than requiring a dismiss click.
- **Post-publish confirmation:** after an Author publishes an article (Flow D/F), the same success-banner treatment on redirect to the published article or "My Articles" list — headline "Your article is live."
**Owning component:** a `SuccessBanner` variant, either a small addition to the existing `Toast` component (a `variant="fullwidth"` or `persistent` prop) or a thin wrapper around it in `src/components/shared/` — reuse `Toast`'s existing color/motion logic rather than building a parallel success component from scratch.

---

### Summary: new shared components introduced by this section

| Component | Purpose | Folder |
|---|---|---|
| `EmptyState` | Generic empty-list/grid treatment (icon + headline + copy + optional CTA) | `src/components/shared/` |
| `OfflineBanner` | Persistent offline/back-online banner | `src/components/shared/` |
| `ErrorBoundary` | Full-page error state for broken routes, with built-in retry | `src/components/shared/` |
| `SkeletonCard` / `SkeletonText` / `SkeletonBlock` | Shimmer skeleton primitives, shape-matched to real content | `src/components/shared/` |

These are also added to `03_FolderStructure.md`'s `src/components/shared/` listing so the folder tree and this spec never drift apart.
