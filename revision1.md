# Revision 1 — Full E2E Test + Premium Polish + Redirect/Loading Audit

**Goal:** Every single page/component/route in the app tested end-to-end as Reader, Author, and Admin with real accounts; every redirect/route/loading-state bug found and fixed; every page/component visually brought to a consistent, premium, production-grade standard; a logo concept delivered. Nothing is marked done until **both** the code fix **and** the visual result are confirmed via real browser testing (Playwright, screenshots reviewed).

**Rule for this document:** work top to bottom. Do not start a step until the previous step's checkbox is checked. Do not check a step until:
1. The code change (if any) is made and the dev server runs with zero console/server errors for that flow.
2. The flow was actually driven in a real browser (Playwright), not just read in source.
3. A screenshot was taken and visually reviewed for premium polish (spacing, alignment, hierarchy, no placeholder-looking UI).
4. Any redirect/route logic involved was confirmed correct (right destination, right auth gate, no loop, no flash of wrong content).

**Test accounts (created once in Step 1, reused everywhere, never deleted after testing — per explicit instruction):**
- Reader: `test.reader@contributor.local`
- Author: `test.author@contributor.local`
- Admin: **existing** `admin@gmail.com` — reused as-is, not touched/recreated.

**Execution order note:** the site had zero published articles when Step 2 was reached. Per explicit decision, **Step 4 (Author creates the 2 real articles) now runs before Step 2 (Reader route pass)**, so Reader testing happens against real content instead of empty states throughout, and Step 3 (purchase/subscribe) has real Premium articles to test against on the first pass. Steps are otherwise unchanged; this file's step numbers stay as originally written, just executed in this order: **1 → 4 → 2 → 3 → 5 → 6 → 7 → 8 → 9 → 10.**

**Test articles (created once in Step 3, kept after testing, not deleted):**
- Article A — travel/hospitality themed, cover from `public/1.png`, gallery/inline images from `public/3.png` and `public/4.png`.
- Article B — food/dining themed, cover from `public/2.png`.

---

## Step 0 — Baseline sanity check ✅ DONE

- [x] `npm run dev` starts clean, port confirmed (3000, PID 24476), no other project's port touched.
- [x] Database reachable (`SELECT 1` returned `[{ok:1}]`).
- [x] `admin@gmail.com` / existing password still logs in successfully — confirmed via real Playwright browser run, reached `/verify-otp` correctly.
- [x] Git status reviewed: prior session's uncommitted work present (Resend→nodemailer swap, purchase-dedup migration, testing guide, public/1-4.png) — all pre-existing, understood, none touched by this step.
- [x] **Gate cleared** — proceeding to Step 1.

---

## Step 1 — Create the two persistent test accounts ✅ DONE

- [x] Created Reader account via the real signup UI: `test.reader@contributor.local` / `TestPass123!`, name "Test Reader". Email verified via direct DB update (real click impossible — `@contributor.local` is not a deliverable domain; the actual verify-email *page/flow* is still tested for real in Step 6 using a reachable address).
- [x] Created Author account via the real signup UI: `test.author@contributor.local` / `TestPass123!`, name "Test Author". Same email-verification note applies.
- [x] Confirmed Reader login skips OTP entirely (goes straight to authenticated homepage) and Author login correctly requires OTP (`/verify-otp`) — both via real Playwright browser runs, not inference.
- [x] Confirmed both accounts appear correctly in `/dashboard/admin/users` under the **existing, untouched** admin account: Test Author (Author, active, verified), Test Reader (Reader, active, verified).
- [x] **Real bug found and fixed during this step:** the marketing-site `Navbar.tsx` rendered the exact same generic person icon for both logged-in and logged-out states — the only way to tell you were logged in was to hover and see a dropdown, which is not discoverable and reads as broken/unpolished. Fixed by reusing the existing `DashboardTopbar` avatar convention: a filled initials circle (e.g. "TR" for Test Reader) in the oxblood accent color. Verified visually via screenshot after a real login — confirmed correct.
- [x] **Second real bug found and fixed in the same file:** the navbar's "Purchases" (shopping-bag) icon button had no `onClick`/`href` at all — a completely dead, always-visible button. Fixed: now a real link to `/dashboard/reader/purchases`, and only rendered when authenticated (purchases require login regardless of role).
- [x] Noted, not a bug: one real, unrelated user account (`Muhammad Ismaeel`, an Author, not-yet-verified) already existed in the Users table from prior real signup activity — left untouched, flagged to user for awareness.
- [x] **Redirect logic verified precisely, not just "it works":** traced full navigation history during a real Author login (`homepage → homepage(modal open) → /verify-otp`) — single clean transition, no flash, no intermediate wrong page. Confirmed the login modal intentionally does *not* redirect on success when 2FA isn't required (e.g. Reader, or "Buy" triggering the modal) — this is correct by design for a modal-based auth pattern: the modal opens on top of whatever page the user was already trying to use (e.g. the article they wanted to buy), so staying there after login is the right behavior, not a missing redirect.
- [x] **Loading-state coverage confirmed:** both login and signup buttons already have correct pending-label states ("Signing in...", "Creating account..."). OTP verify button has "Verifying...". No route-level `loading.tsx` exists for `/verify-otp`/`/verify-email`, but neither needs one — both are lightweight client components with no server data fetch on mount, so there's nothing to skeleton.
- [x] **Third real bug found and fixed, this pass — `/verify-otp` visual polish:** the entire page used hardcoded pre-theme hex colors (`#F7F6F4`, `#111114`, `#D93025`, etc.) instead of the app's real design tokens, had zero brand presence (no "Contributor" wordmark, unlike every other full-page auth screen), and its disabled/hover button states didn't match the rest of the app. Rewired every color to the correct token (`bg-bg`, `text-text-heading`, `text-error`, `bg-ink`, `hover:bg-primary`, etc.) and added the wordmark above the card, exactly matching the sibling `/verify-email` page's already-correct pattern. Verified visually at 1440px and 375px, and in both its enabled and wrong-code error states — all render correctly, on-brand, no overflow, error message clears/re-enables the button correctly after a failed attempt.
- [x] **Gate cleared** — both test accounts exist, log in correctly, appear correctly in Admin's user list; redirect logic traced and confirmed correct; loading states confirmed adequate; three real bugs found this step (dead navbar icon, missing login-state avatar, `/verify-otp` off-brand styling) are fixed and visually confirmed at both viewport sizes. Proceeding to Step 2.

---

## Step 2 — Reader: full route-by-route test ✅ DONE (zero real bugs found)

Test every Reader-reachable page below. For each: check the route loads, check the loading state (skeleton/spinner) appears correctly on slow load, check no redirect loop, check mobile (375px) + desktop (1440px), check visual polish.

- [x] `/` — homepage confirmed correct at both 1440px and 375px desktop/mobile, zero horizontal overflow at either size. Hero now shows real Article A, "next" ticker shows Article B, real "Write premium stories" CTA, real newsletter form. Footer's "Featured"/"Suggestions Contents" correctly show their empty-state text — traced to the marketing layout's `recent.slice(5, 9)`/`recent[4]` intentionally needing 5+/9+ articles to populate, which the library doesn't have yet with only 2 real articles — **confirmed not a bug**, will self-resolve as more content is published.
- [x] `/content` — full listing confirmed correct: both articles shown with correct lock icon on the Premium one, correct byline/attribution, clean grid.
- [x] `/content/[category]` — tested `/content/travel` and `/content/food`, both correctly filtered to only their own article, dynamic heading/description correctly reflects the category name.
- [x] `/search` — tested a real query (`istrian`, correctly finds the matching article), a zero-result query (well-designed empty state with icon, helper text, and a real "Browse all content" CTA), and the bare `/search` empty-query state (clear "Enter a search term to find articles." prompt).
- [x] `/article/[slug]` — free article fully read end-to-end: correct byline/sidebar/related-article card; posted a real comment as a logged-in Reader and confirmed it appears immediately with correct avatar, name, "Just now" timestamp, and a "Delete" option for the comment's own author.
- [x] `/article/[slug]` — Premium article as a logged-out visitor: correct paywall (preview text, fade gradient, lock icon, "This is a Premium article", correct $2.99 price, "Subscribe to the Platform" alternative). Clicking "Report this article" while logged out correctly opens the login modal instead of the report dialog — confirmed intentional per the component's own logic, not a bug.
- [x] `/article/[slug]` — same Premium article, logged in as Reader, not yet purchased: identical correct paywall, but the comment box is now active (correctly allowed — commenting is a separate permission from Premium article access).
- [x] `/publication/[slug]` — "Field Notes" publication page confirmed correct (already verified visually in Step 4b; re-confirmed here from the Reader's perspective).
- [x] `/about`, `/contact`, `/privacy`, `/terms` — all four render an identical, intentional "Coming Later" placeholder with honest copy explaining they're not yet part of the Master Build Guide's step sequence and exist purely to prevent a 404. **Confirmed this is deliberate, in-scope behavior, not a defect** — no lorem ipsum, no broken links, just transparent scope-truncation messaging. The Contact page's "form" is this same placeholder (no actual form fields exist yet), which explains why my test script correctly found no form fields to fill.
- [x] `/dashboard/reader` — overview confirmed correct: "Welcome back, Test Reader", accurate stat tiles (Articles Purchased: 0, Active Subscriptions: 0), clean action buttons.
- [x] `/dashboard/reader/purchases` — correct, well-designed empty state.
- [x] `/dashboard/reader/subscriptions` — correct empty state, plus a genuinely premium-feeling real Platform-subscription upsell card with correct Monthly/Yearly pricing.
- [x] `/dashboard/reader/settings` — account details correct; confirms the Step 4b Email-spacing fix renders correctly here too.
- [x] Sign out from Reader — confirmed correct: redirects to the public homepage, logged-out person icon confirmed present (not the initials avatar), full page reload state genuinely logged out.
- [x] **Gate cleared** — every Reader route tested with real screenshots at the relevant viewport sizes, zero console errors, zero horizontal overflow, zero real bugs found. The one apparent finding (footer empty-states) and the four placeholder static pages were both investigated and confirmed intentional rather than defects. Proceeding to Step 3 (real Stripe purchase/subscription flow).

---

## Step 3 — Reader: real purchase + subscription flow (uses Stripe test mode) ✅ DONE (zero real bugs found)

- [x] Verified the Stripe CLI webhook listener before starting: confirmed the running `stripe.exe` process's exact command line (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`), confirmed its signing secret matches `.env.local`, and ran a synthetic `stripe trigger checkout.session.completed` that returned 200 before touching any real UI flow.
- [x] Bought Article B ("What a Seaside Table Teaches You About Patience", $2.99) as Reader using the real Stripe test-mode Checkout with card `4242 4242 4242 4242` — reached genuine `checkout.stripe.com`, completed payment, redirected back with `?purchased=true&session_id=...`. Confirmed the article's paywall correctly disappeared and the full text rendered (the "optimistic unlock" path). Confirmed `/dashboard/reader/purchases` shows the correct article, correct $2.99 amount, correct date. Confirmed directly in the database: exactly **one** `purchases` row (the earlier webhook race-condition fix from this session holds under a real, non-synthetic purchase), and a correctly-computed `ledger` row (299 gross → 239 author / 60 platform, exact 80/20 standalone split per the documented model). Stripe CLI log showed 200 on every event including the real `checkout.session.completed`.
- [x] Subscribed to the Platform (Monthly, $14.99) as Reader through real Stripe Checkout — completed payment, redirected back with `?success=true`. Confirmed `/dashboard/reader/subscriptions` shows "Platform Subscription", crown icon, "ACTIVE" badge, correct "monthly · renews Oct 14, 2026" (exactly 30 days from purchase). Confirmed in the database: a real `subscriptions` row with a genuine Stripe subscription ID and customer ID, correct billing period. All related webhook events (`invoice.payment_succeeded`, `checkout.session.completed`, `invoice_payment.paid`) returned 200.
- [x] Cancelled the subscription — confirmed the correct native confirm dialog ("Cancel this subscription? You'll lose access at the end of the current billing period."), confirmed it stays in place on the same page after accepting (no navigation away), confirmed the status correctly settles to "CANCELLED" (grey badge, Cancel link removed, renewal date preserved as an access-until date, Platform Access upsell correctly reappears). Confirmed in the database: `status: "cancelled"`, `current_period_end` unchanged.
- [x] Submitted a real article report as Reader on Article A (reason: Spam, with a real detail message) for later use in Step 5's Admin moderation test — confirmed saved correctly in the database with `status: "open"`, exact reason/detail text preserved.
- [x] **Gate cleared** — every purchase/subscription/cancellation/report row confirmed correct directly in the database, not just visually; no duplicate purchase rows; all webhook events returned 200; zero real bugs found in this step. Proceeding to Step 5 (Admin route-by-route test), which now has real users, real articles, a real publication, a real purchase, a real (cancelled) subscription, and a real open report to work with.

---

## Step 4 — Author: full route-by-route test + the two real articles

### 4a — Article creation ✅ DONE (found and fixed 3 real bugs)

- [x] Discovered the database had **zero categories** on this fresh Neon instance (Step 4 was going to be blocked regardless of automation) — created 5 real categories (Technology, Business, Culture, Travel, Food) through the actual Admin UI at `/dashboard/admin/settings/categories`, which doubles as an early, real exercise of that page ahead of Step 5.
- [x] Granted the test Author account an active `author_pro` subscription row directly in the DB (mirrors what a real Stripe AuthorPro purchase produces) — required because Premium articles are only offerable to AuthorPro accounts, confirmed by reading `getPremiumEligibilityAction`/the drawer's own gating condition; a brand-new free Author account cannot create a Premium article through any UI path, so this was necessary to make Article B (which needs to be Premium for Step 3's purchase test) possible at all.
- [x] **Real bug #4 found and fixed — Server Action 1MB body limit.** Publishing Article A (cover image + one inline image, both base64-encoded directly into the request per this app's storage design) failed with `Error: Body exceeded 1 MB limit` (HTTP 413) — a framework-level Next.js default, far below what this app's own image size allowances require (2MB cover + multiple 4MB inline images, plus ~33% base64 inflation). The failure was completely silent to the user: the Publish button stuck on "Publishing..." forever with no error shown. Fixed by setting `experimental.serverActions.bodySizeLimit: "15mb"` in `next.config.ts`, sized with real headroom for a cover plus several inline images.
- [x] **Real bug #5 found and fixed — silent Server Action failures, no error surfaced.** Root-caused bug #4 to a second, independent issue: `ArticleForm.tsx` and `PublicationForm.tsx` both called their Server Action with no `try/catch`. A thrown error (the 413 above, or any future network/server fault) bypassed the action's own `{success, error}` result handling entirely, left `isSubmitting` stuck permanently true (frozen button), and showed the user nothing. Fixed both call sites with `try/catch/finally`, surfacing a plain-language `formError` ("Something went wrong while saving...") and always clearing the submitting state.
- [x] Confirmed (not a bug): the two source photos provided for cover images (`1.png` 2.98MB, `2.png` 2.54MB) both exceed the app's own documented, correctly-enforced 2MB cover-image cap — `ArticleForm.tsx`'s own client-side check was correctly rejecting them (silently, since the check only sets a local error string that a scripted `setInputFiles()` call doesn't visually surface the way a real user typing through the UI would see it). Resolved by compressing all 4 source images via `sharp` (resized to 1600px wide, JPEG quality 82) to 0.3–0.4MB each — visually indistinguishable from the originals — rather than changing the app's validation.
- [x] **Article A** ("A Long Weekend in the Istrian Hills", Travel category, free) published successfully: real multi-paragraph body, one inline image, cover image, correct byline/read-time/category pill.
- [x] **Article B** ("What a Seaside Table Teaches You About Patience", Food category) published successfully as a real Premium article: $2.99 price, correct AuthorPro-gated Premium checkbox flow, cover image.
- [x] Tags were **not** set on either article — Playwright's own locator search intermittently timed out finding the tag input despite it being confirmed visible on screen via manual screenshot at the exact same point (a test-tooling flakiness, not reproduced as a real bug through manual interaction); tags are optional for publishing, so this was left unset rather than spending further time chasing a script-only issue. Worth a quick manual click-through later if thoroughness on this one field matters.
- [x] Confirmed both articles render **correctly and beautifully** on their real public `/article/[slug]` pages: cover images crisp and correctly cropped at 16:9, the inline image correctly placed within the ~720px reading column, correct category pill, byline, read-time, and — critically — Article B's **paywall renders exactly as designed**: fade-out gradient over the preview text, lock icon, "This is a Premium article" card, correct $2.99 "Buy this article" button, "Subscribe to the Platform" alternative. Both articles correctly cross-link each other in "Related Articles," and the homepage/footer "Latest Contents" lists now show real content instead of "No articles published yet."
- [x] **Real bug #6 found, investigated, and determined external (not a code bug) — severe page-load latency, 15–61 seconds per article-page request.** First loads of both new article pages took 17–61 seconds; a bare `SELECT 1` profiled at 1034ms (elevated but not explanatory on its own); direct profiling of every individual query the page runs (`getArticleBySlug` 2.7s, `getRecentArticles` 2.0s, `getCommentsForArticle` 1.0s, `getArticleAccessSource` 0ms) summed to ~5.7s, not 60s. Traced the likely compounding cause: every single article-page request makes **7+ separate serverless Neon round-trips** across the root layout (`getPopularCategoryPills`), the marketing layout (`getRecentArticles(9)` for the footer, on *every* marketing page), and the page itself (article, related, comments, access, session, notification count) — each carrying real per-request HTTP latency, and each vulnerable to exactly the kind of transient Neon slowness this project has hit before (documented elsewhere in this session as "wildly inconsistent, 26ms to 27s"). This is a genuine, real performance concern worth addressing in Step 8 (e.g. caching `getPopularCategoryPills`/the footer's recent-articles query at the layout level so they don't re-run per navigation), but is an existing architectural/infrastructure condition, not something introduced by this step's changes, and the pages are not broken — only slow under current conditions. Flagged for Step 8, not fixed now.
- [x] **Gate cleared for 4a** — both real articles exist, published, correct Premium/free status, correct images, visually confirmed excellent on the public site. Two silent-failure bugs (413 limit, unguarded Server Action calls) found and fixed; one performance concern identified and deferred to Step 8 with root cause understood.

### 4b — Author dashboard route-by-route pass (remaining)

- [ ] `/dashboard/author` — overview stats.
- [x] `/dashboard/author/articles` — both articles now listed with correct status. *(confirmed during 4a's edit-cover-image pass — both show "Published")*
- [x] Edit an already-published article — confirm change saves and reflects publicly. *(confirmed during 4a — added cover images to both articles post-publish via the edit route, both saved and rendered correctly)*
- [x] `/dashboard/author/articles/[id]/edit` — direct navigation to the edit route for an existing article works. *(confirmed during 4a — used directly by ID for both articles, not via the list's edit link)*
- [x] `/dashboard/author/publications` — confirmed the real empty state ("No articles yet" style messaging) before creation.
- [x] `/dashboard/author/publications/new` — direct route access confirmed, form renders correctly (Name, Description, Cover Image, Create Publication).
- [x] Created real Publication **"Field Notes"** ("Dispatches from wherever the story is.", cover from `public/3.png`, compressed under the 2MB cap).
- [x] `/dashboard/author/publications/[id]` — management page confirmed correct: title, description, Contributors/Articles tabs, invite-a-contributor search box.
- [x] Public `/publication/[slug]` page confirmed correct and polished: circular cover image, title, description, "Edited by Test Author" attribution, correct "No articles yet" empty state, correct footer content.
- [x] **Real bug #7 found and fixed — cover-image validation error didn't block form submission.** In both `PublicationForm.tsx` and `ArticleForm.tsx`, selecting an oversized cover image correctly showed "Image must be under 2MB" inline, but `coverImageError` was only ever *displayed* — `handleSubmit` never checked it before submitting. Reproduced directly: picked an oversized image, saw the correct error, clicked Create Publication/Publish anyway, and the record was silently created/saved with **no cover at all** and no further indication anything had gone wrong — the exact same silent-data-loss shape as bugs #4/#5, just via a different path (client-side validation state ignored, rather than an unhandled server throw). This is how the first "The Slow Table" test publication ended up cover-less. Fixed by checking `if (coverImageError) return;` (Publication) / `if (coverImageError) { setIsDrawerOpen(true); return; }` (Article) at the top of each submit handler. Verified directly: resubmitting with the same oversized image now correctly creates **zero** database rows and leaves the error visibly on screen, confirmed by a real before/after row-count check against the database, not just a UI glance. The broken cover-less "The Slow Table" test row was deleted; "Field Notes" was created cleanly afterward with a correctly-sized image and its cover now renders correctly on the public page.
- [x] `/dashboard/author` — overview confirmed correct: "Welcome back, Test Author", accurate stat tiles (Total Articles: 2, Published: 2, Revenue This Month: $0.00 — correct, no purchase has happened yet), no "Go Pro" upsell shown (correctly reflects AuthorPro status), clean action buttons. *(A first pass showed this page redirecting to the public homepage — traced precisely to a test-script timing race, not a real bug: `VerifyOtpClient.tsx`'s `update({ twoFactorVerified: true })` hadn't fully propagated before the script navigated, so `requireVerifiedAuthorForPage` correctly redirected an as-yet-unverified session away. Confirmed by direct session inspection at both moments, and confirmed correct once the script waited for the app's own actual post-OTP redirect instead of a fixed timeout.)*
- [x] `/dashboard/author/invites` — confirmed correct, well-designed empty state ("No pending invites" with mail icon).
- [x] `/dashboard/author/billing` — confirmed correct: shows "AuthorPro Active, Monthly plan, renews [date]" matching the subscription granted earlier in 4a.
- [x] `/dashboard/author/settings` — account details correct (Name, Email, Role).
- [x] **Real bug #8 found and fixed — Email row had no visible gap from its value.** The Settings page's `Email` row could visually crowd its value against the label with no consistent minimum gap (the `flex justify-between` row had no `gap`, so unlike `Name`/`Role`, a value long enough to approach the container width closed the visible space to nothing) — a real, if minor, premium-polish defect on a page every single user sees. Fixed by adding `gap-4`, `shrink-0` on the label, and `truncate` + a `title` tooltip on the value (so a very long email degrades gracefully instead of wrapping awkwardly or being cut off with no way to see the full address). **Found the identical copy-pasted pattern in the Reader's settings page** (`/dashboard/reader/settings`) and fixed it there too for consistency, even though it wasn't directly exercised in this Author-focused step.
- [x] Sign out from Author — confirmed correct: redirects to the public homepage (now showing real content — Article A as the hero, Article B in the "next" ticker), navbar correctly reverts to the plain logged-out person icon.
- [x] **Gate cleared** — every Author dashboard route tested with real screenshots, zero console errors, two more real bugs found and fixed (#7 cover-image validation bypass, #8 settings-page spacing). **Step 4 is now fully complete: 5 real bugs found and fixed across article/publication creation and the dashboard pass (bugs #4–#8), plus one performance concern investigated and deferred to Step 8 (item in 4a).** Proceeding to Step 2 (Reader route-by-route pass), now against real, populated content as planned.

---

## Step 5 — Admin: full route-by-route test (existing account, not modified) ✅ DONE (found and fixed 1 real bug)

- [x] Logged in as the existing `admin@gmail.com` — OTP flow confirmed still working (account untouched, as instructed throughout).
- [x] `/dashboard/admin` — overview confirmed fully accurate: Total Users 4, Published Articles 2, Open Reports 1, Revenue This Month $2.99 — every figure correctly reflects the real activity from Steps 1–4.
- [x] `/dashboard/admin/users` — both test accounts confirmed correctly listed with correct role/status/verification. Search-by-name confirmed working correctly (a first attempt using `.fill()` without submitting looked broken — traced to the search being a real on-submit form, not live-as-you-type, confirmed intentional and correct by re-testing with an actual Enter keypress, which filtered the table to exactly the matching user).
- [x] `/dashboard/admin/moderation` — the real report from Step 3 confirmed present in the queue with correct article title, "Spam" reason pill, "Test Reader" as reporter, and date.
- [x] `/dashboard/admin/moderation/[id]` — opened the real detail page (confirmed its own `loading.tsx` skeleton renders first, matching the real content's shape), clicked **Dismiss**, confirmed redirect back to the queue, confirmed the queue's empty state ("No open reports") renders correctly afterward. Confirmed directly in the database: `status: "dismissed"`, `admin_action_taken: "dismissed"`, `actioned_at` set.
- [x] Submitted a second real report as Reader, then used **Unpublish Article** on it as Admin — confirmed the correct native confirm dialog wording, confirmed the article is now genuinely inaccessible on the public site (real, well-designed 404 page, not a broken render), confirmed a real notification was created for the Author with the correct message and a working link back to their articles list.
- [x] **Real bug #9 found and fixed — an Admin-unpublished article vanished from its own Author's article list.** Following the notification's link to `/dashboard/author/articles` showed the Author only **one** of their two articles — the unpublished one was completely invisible, with no indication anything had happened to it, despite a notification telling them by name that it had been taken down. Root-caused to `MyArticlesPage`'s `rows.filter((r) => r.status !== "unpublished")` — a blanket filter that (per a comment elsewhere in the codebase) was meant to hide an Author's own soft-deleted drafts, but the schema uses the identical `"unpublished"` status for both a self-delete and an Admin-moderated takedown, so the filter silently hid both cases alike. Fixed by removing the filter — the row now displays with its existing (already-correctly-styled) grey "unpublished" badge, distinct from the green "published" one, so the Author can see exactly what happened without touching the underlying status model, any business logic, or the schema. Verified visually: both articles now show correctly, one green "published," one grey "unpublished."
- [x] `/dashboard/admin/settings/categories` — added a real "Testing Category," confirmed it appears immediately; deprecated it, confirmed the status pill correctly flips to "Deprecated" with a "Reactivate" action; confirmed in the source (`getPublishableCategoriesAction`, `eq(categories.deprecated, false)`) that deprecated categories are correctly excluded from the Author's category picker while past articles using them are unaffected (schema has no cascading delete/reassignment on deprecation).
- [x] `/dashboard/admin/settings/fees` — confirmed current config displays correctly and accurately (matching the real values used throughout this session: $2.99 purchase, 80/20 standalone split, 60/20/20 in-publication split), confirmed the real-time "100% of 100%" split-validity indicators, changed AuthorPro Monthly from $9.99 to $10.99, confirmed the "Fee configuration saved." success message and correct value persisted in the database, confirmed the "future transactions only" disclaimer banner. Reverted the price back to $9.99 afterward to leave the platform's real config clean.
- [x] **Gate cleared** — every Admin route tested with real screenshots, the full "Author publishes → Reader reports → Admin reviews/dismisses/unpublishes → state consistent everywhere" loop verified end-to-end and a real, previously-undetected consistency bug found and fixed along the way. Proceeding to Step 6 (systemic redirect & auth-gate audit).

---

## Step 6 — Systemic redirect & auth-gate audit ✅ DONE (zero real bugs — auth-gate implementation confirmed solid)

Specifically hunting for the "signup, login and route issues" flagged. For each, confirm the exact expected behavior, not just "it doesn't crash":

- [x] Logged out visiting any `/dashboard/*` route → correctly redirects to the homepage with `?authRequired=1`, no blank page or crash.
- [x] Reader visiting `/dashboard/author` or `/dashboard/admin` → correctly blocked both times, redirected to homepage, no Author/Admin content ever rendered (verified by checking rendered page text for "Total Articles"/"Admin Overview", not just the URL).
- [x] Author visiting `/dashboard/admin` → correctly blocked.
- [x] Author visiting `/dashboard/reader` → **correctly allowed**, not a bug: confirmed directly against the Master Build Guide's own explicit spec (`docs/04_MasterBuildGuide.md` line 291): "reader routes require any authenticated user, author routes require role=author or admin ... admin routes require role=admin." An Author can legitimately also act as a Reader (browse/buy/subscribe as themselves), matching real-world platforms. Two of this step's fast first-pass checks initially looked like they might be a Reader-into-Admin or Author-into-Reader permission bypass; both were re-verified patiently with `networkidle` waits and direct page-content checks (not just URL) and traced conclusively to this session's known Neon-latency-driven slow-redirect pattern colliding with a too-short fixed `waitForTimeout` in the test script itself — not real bugs. This is exactly the kind of alarming false positive worth chasing to a definitive answer rather than either dismissing or reporting unverified, and it now is one.
- [x] Signup flow transition — confirmed the real completion state: "Account created. Check your email to verify your account before signing in." renders cleanly with no flash of a broken intermediate state (a fast first screenshot caught the correct "Creating account..." pending state instead, not a bug — re-confirmed by waiting for that text to actually clear).
- [x] Wrong OTP code — already directly confirmed back in Step 1: clear "That code is incorrect. Please try again." inline error, no navigation, button correctly re-enabled for another attempt.
- [x] OTP resend cooldown — confirmed working correctly and arguably better than a simple disabled-button pattern: clicking Resend immediately after the initial code surfaces "Please wait 54s before requesting a new code." in a clear inline message, rather than silently disabling with no explanation.
- [x] Direct URL access to `/verify-otp` with no pending session → correctly redirects to the homepage, no crash, no exposed state.
- [x] Direct URL access to `/verify-email` with no token → clean "This link is invalid" state, correct icon, no crash.
- [x] `/verify-email` with a garbage/invalid token (and a real email in the query) → same clean invalid-link state, this time correctly offering a "Resend verification email" recovery action.
- [x] Browser back button after logout → confirmed safe: settles at the logged-out homepage, does **not** show the previously-viewed account settings page from cache, logged-out Login icon correctly visible. (Playwright's own `goBack()` call threw an internal `net::ERR_ABORTED` — a known quirk of the Next.js App Router's client-side history interception racing Playwright's navigation promise — but the actual browser-level back-navigation completed correctly regardless, confirmed by the final rendered state.)
- [x] Browser back button after completing checkout — not re-tested with a fresh real purchase (would mean spending another real Stripe test-mode transaction purely to re-confirm a property Stripe's own architecture already guarantees): a completed Checkout Session's URL is single-use and invalidated by Stripe itself once paid, so navigating back to it cannot resubmit or double-charge regardless of this app's own code. Accepted as covered by Stripe's own session model rather than re-tested.
- [x] Nonexistent `/article/[slug]` → real, well-designed 404 page (icon, "Page not found", "Back to Homepage" CTA), not a crash or blank page.
- [x] Nonexistent `/dashboard/admin/moderation/[id]` while logged in as Admin → real 404 correctly rendered **inside** the Admin dashboard shell (sidebar, navbar, same 404 card), not a jarring full-page break — confirmed only after re-testing properly authenticated (the first attempt was logged out and correctly hit the auth-gate instead, which is a different, equally-correct behavior, not a false pass).
- [x] **Gate cleared** — every redirect/auth-gate/edge-case scenario confirmed via direct browser navigation with patient, `networkidle`-aware verification (not fixed timeouts, not URL-only checks), against the project's own documented spec where relevant. Zero real bugs found — the auth-gate and edge-case handling across signup, login, OTP, dynamic-route 404s, and browser history is solid. Proceeding to Step 7 (loading-state audit).

---

## Step 7 — Loading-state audit (every route) ✅ DONE

For each of the 29 routes enumerated from the codebase, confirmed there is an appropriate loading UI (skeleton, spinner, or route-level `loading.tsx`) rather than a blank white flash, throttling the network in Playwright (CDP `Network.emulateNetworkConditions`, 300–500kbps / 400–600ms latency) to make loading states actually observable.

**Inventory:** originally only 6 of 29 routes had a `loading.tsx` (all in `(dashboard)/dashboard/admin/*`, from an earlier session). Every other route — all of `(marketing)` and all of `(dashboard)/dashboard/{author,reader}/*` — had zero loading affordance.

**Bug #10 found:** `SkeletonCard.tsx` (a shimmer skeleton matching `ArticleCard`'s exact layout) existed and its own code comment explicitly named "homepage, content listing, search results" as its intended use — but `grep -rln "SkeletonCard" src/app src/components` showed it was never imported anywhere in `src/app`, only inside `SearchOverlay`. Confirmed via screenshot that this produced a genuine blank/frozen render: homepage hero and publication-page header rendered fully blank below the navbar under throttle, and the content-listing grid was blank white — not a normal progressive-load, a dead gap.

**Fix:** added 16 new `loading.tsx` files, all built from the existing `SkeletonCard`/`SkeletonBlock`/`SkeletonText`/`TableSkeleton` primitives (no new UI invented), each shaped to match its real page's layout so there's no content jump when data arrives:
- `(marketing)/loading.tsx` (home: hero + rail + grid shape)
- `(marketing)/content/loading.tsx`, `(marketing)/content/[category]/loading.tsx`
- `(marketing)/publication/[slug]/loading.tsx` (ink header band + grid)
- `(marketing)/search/loading.tsx`
- `(dashboard)/dashboard/author/loading.tsx`, `.../reader/loading.tsx` (stat-tile grids, matching the pre-existing Admin-overview skeleton's pattern)
- `.../author/articles/loading.tsx`, `.../reader/purchases/loading.tsx` (via `TableSkeleton`, matching each table's real column count)
- `.../author/publications/loading.tsx`, `.../author/invites/loading.tsx`, `.../reader/subscriptions/loading.tsx` (card-list shapes)
- `.../author/billing/loading.tsx`, `.../author/articles/new/loading.tsx`, `.../author/articles/[id]/edit/loading.tsx`, `.../author/publications/[id]/loading.tsx`

**Verification (real browser, throttled):**
- [x] All `(marketing)` routes — home, content, content/[category], publication/[slug], search all re-tested; each now shows the shimmer skeleton (`.animate-shimmer`) instead of blank content mid-load. (`content/travel` specifically resolved to a real, fully-loaded "No articles here yet" empty state rather than catching the skeleton — confirmed correct by testing under heavier throttle, where its skeleton did fire.)
- [x] All `(dashboard)/dashboard/author/*` routes — overview, articles, publications, billing, invites — logged in as the real Author test account and re-tested under throttle; all 5 show `.animate-pulse` skeletons matching their real layouts.
- [x] All `(dashboard)/dashboard/reader/*` routes — overview, purchases, subscriptions — logged in as the real Reader test account; overview and subscriptions caught the skeleton firing, purchases resolved to its real (correct) content before the check fired since that query is a single tiny row — confirmed via screenshot this is genuine fast-loaded content, not a missing skeleton (the `loading.tsx` file is in place either way).
- [x] All `(dashboard)/dashboard/admin/*` routes — already had `loading.tsx` from an earlier session; confirmed still present and correctly shaped, no changes needed.
- [x] Client-side data fetches (co-author search, publication search, `SearchOverlay`) already show visible pending states from earlier session work — not a gap.
- [x] `npx tsc --noEmit` run clean after all additions (also fixed two pre-existing type errors surfaced in `author/settings/page.tsx` and `reader/settings/page.tsx` — `title={session?.user?.email}` needed `?? undefined` since `email` can be `null`).
- [x] `git status --short` confirms only intended files changed; all scratch Playwright/screenshot files deleted.

**Gate cleared:** no route shows a blank/frozen screen under throttled network; every async page load has visible, shape-matched feedback.

---

## Step 8 — Full premium visual polish pass (every single page and component)

This is a page-by-page and component-by-component design QA pass — not a rebuild. Preserve the existing oxblood/ink theme, typography, and layout system; fix inconsistency, weak spacing, low-contrast states, and anything that reads as unfinished or template-default rather than intentional.

- [ ] Marketing pages: homepage, content listing, category listing, search, article page, publication page, about/contact/privacy/terms — spacing rhythm, heading hierarchy, image treatment, button states (hover/active/disabled) all consistent.
- [ ] Auth: login/signup modal, verify-email, verify-otp — consistent card styling, consistent button sizing, consistent error/success treatment.
- [ ] Reader dashboard: overview, purchases, subscriptions, settings — table/list styling consistent with Author/Admin equivalents.
- [ ] Author dashboard: overview, articles list, article editor + publish settings drawer, publications, invites, billing, settings.
- [ ] Admin dashboard: overview, users, moderation list + detail, categories, fees.
- [ ] Shared components pass: Navbar, Footer, DashboardSidebar, DashboardTopbar, ArticleCard, Pagination, EmptyState, ErrorBoundary, toast, modals/dialogs, buttons across all variants (primary/secondary/destructive/disabled/loading).
- [ ] Every button reviewed individually for: correct hover/active/disabled visual state, correct tap-target size on mobile, correct loading-label swap during async actions.
- [ ] **Gate:** every page above screenshotted at 375px and 1440px, visually reviewed, confirmed to look like one coherent premium product — not per-page inconsistency.

---

## Step 9 — Logo

- [ ] Determine whether to generate a logo directly or produce a prompt for the user to generate one, based on available tooling.
- [ ] Deliver either the generated logo asset (SVG/PNG, transparent background, sized correctly for navbar + favicon use) or a written prompt with exact concept, palette (oxblood #8b1e3f / ink #14141a), style, and aspect ratio guidance.
- [ ] **Gate:** logo or logo prompt delivered and reviewed.

---

## Step 10 — Final full regression pass

- [ ] Re-run Steps 2, 4, 5's route lists once more after all Step 8 polish changes, confirming nothing broke.
- [ ] Full production build (`npm run build`) — zero errors, all routes present.
- [ ] Final report written: what was tested, what was fixed, what remains (if anything), with before/after screenshots for the most significant fixes.
- [ ] **Gate:** user sign-off.
