**Article Directory Platform**

High-Level Product Specification

*Phase 1*

Prepared for: Development Team

# **1\. Overview**

A content publishing platform where registered Authors write articles on any subject permitted under the Platform's Terms & Conditions, and Readers consume that content. The platform introduces a monetisation layer: Authors can go Pro to paywall content and form Publications; Readers can pay per article or subscribe for unlimited access; the Platform takes a share of all Premium revenue.

# **2\. User Roles & Permissions**

## **2.1 Reader (User)**

* Free registration; browses and reads all standard (free) content at no cost.

* Can purchase individual Premium articles (pay-per-article).

* Can subscribe to a single Publication for unlimited access to that Publication's Premium content.

* Can subscribe to the Platform for unlimited access to all Premium content platform-wide, ad-free.

## **2.2 Author (free tier)**

* Open registration; verified by email and OTP-based 2FA.

* Publishes articles — all content is free to read.

* Can apply pre-defined Categories and create own Tags.

* Can co-author articles jointly with other Authors (also free, no revenue share).

* Can be invited to publish into another user's Publication.

## **2.3 AuthorPro (paid subscription: monthly/yearly)**

* Everything a free Author can do, plus:

  * Mark some or all of their own articles as Premium (paywalled).

  * Create a Publication (a multi-author collection, e.g. a digital magazine).

  * Invite other Authors (free or Pro) to contribute to their Publication; invite must be accepted by both parties.

## **2.4 Platform Admin**

* Manage user accounts (Readers, Authors, AuthorPro) — view, suspend, verify.

* Configure fee structures — subscription prices, pay-per-article prices, revenue split percentages.

* Manage pre-defined Categories.

* Review flagged/reported content.

# **3\. Content Model**

| Concept | Description |
| :---- | :---- |
| Article | Core content unit. Written by one Author, or jointly by multiple Authors. Free by default. |
| Premium flag | Optional, AuthorPro only. Marks an article as paid access (pay-per-article or via subscription). |
| Category | Fixed taxonomy, managed by Admin. Applied by Author at publish time. |
| Tag | Free-form, created by Authors. Not Admin-controlled. |
| Publication | A collection of articles from multiple Authors, owned by an AuthorPro user. Can contain free and/or Premium articles. |

# **4\. Monetisation & Revenue Splits**

The Platform acts as payment intermediary in Phase 1 — it collects all payments and distributes payouts to Authors and Publication Owners. Direct-to-author payment is a possible future enhancement, subject to the chosen payment service provider.

## **4.1 Revenue splits**

| Scenario | Split |
| :---- | :---- |
| Premium article, not in a Publication | Author 80% / Platform 20% |
| Premium article, inside a Publication | Author 60% / Publication Owner 20% / Platform 20% |
| Free article (incl. jointly authored) | No revenue share — not monetised |

## **4.2 Platform subscription pool distribution**

When a Reader pays for an all-access Platform subscription (rather than per-article), that revenue must be distributed across the Premium articles they actually read during the billing period. Recommended Phase 1 approach: an even split across the distinct Premium articles a subscriber reads in a period, then apply the standard revenue split above per article. This is simple to implement (a basic "read event" log) and simple to explain to Authors. It can be refined later (e.g. weighted by read-time) once usage data is available.

Open item to confirm with development: the precise definition of a qualifying "read" (e.g. article opened vs. a minimum scroll depth or time-on-page).

# **5\. Subscription Structure**

| Plan | Who | Grants |
| :---- | :---- | :---- |
| AuthorPro | Authors | Ability to paywall content, create Publications, invite contributors |
| Pay-per-article | Readers | One-off access to a single Premium article |
| Publication subscription | Readers | Unlimited access to one Publication's Premium content |
| Platform subscription | Readers | Ad-free, unlimited access to all Premium content platform-wide |

Reader subscriptions are independent of one another. If a Reader with an active Publication subscription later subscribes to the Platform, the Publication subscription is superseded/cancelled, since Platform access already includes it. Phase 1 keeps plan design simple — a single tier per subscription type (monthly/yearly billing); multiple tiers may be introduced later.

# **6\. Collaboration & Publications Workflow**

## **6.1 Joint authorship**

* Any Author (free or Pro) can co-author an article with another Author.

* Jointly authored articles are always free — no revenue share applies.

## **6.2 Publications**

* Only AuthorPro users can create a Publication.

* The Publication Owner invites other Authors to contribute.

* The invited Author must accept the invite/terms before contributing.

* Articles inside a Publication may be free or Premium, at the contributing Author's discretion.

# **7\. Platform Admin Capabilities**

* User management: view, verify, suspend Readers and Authors.

* Fee configuration: subscription prices, pay-per-article prices, revenue split percentages.

* Category management.

* Moderation queue: review articles flagged via "Report this article."

Future consideration: automated pre-publish content review via an AI model, ahead of an article going live.

# **8\. Third-Party Reliance**

| Service | Purpose |
| :---- | :---- |
| Payment Service Provider (PSP) | Handles all Reader payments, Author/Publication payouts, and subscription billing. |
| Email service | Account verification and OTP delivery for 2FA. |

# **9\. Key User Flows**

## **9.1 Reader — purchasing a Premium article**

1. Reader browses or searches and opens a Premium article.

2. Article body is shown truncated/locked with a paywall prompt.

3. Reader chooses: buy this article, subscribe to the Publication, or subscribe to the Platform.

4. Reader completes payment via the PSP.

5. Full article unlocks; access is recorded against the Reader's account.

## **9.2 Author — publishing a Premium article**

6. Author (verified AuthorPro) writes/edits an article.

7. Author selects a Category and adds Tags.

8. Author toggles the article to Premium and sets pricing (if applicable).

9. Author submits for publish; article goes live (Phase 1: no pre-publish AI review).

10. Article appears on the Author's profile and, if applicable, inside the selected Publication.

## **9.3 AuthorPro — creating a Publication and inviting a contributor**

11. AuthorPro user creates a new Publication (name, description, cover).

12. Owner searches for and invites another Author to contribute.

13. Invited Author receives the invite and reviews terms.

14. Invited Author accepts (or declines).

15. On acceptance, the Author can now publish articles directly into that Publication.

## **9.4 Reader — subscribing to the Platform**

16. Reader selects "Subscribe" and chooses monthly or yearly billing.

17. Reader completes payment via the PSP.

18. Any existing Publication-level subscription is cancelled/superseded.

19. Reader gains ad-free, unlimited access to all Premium content.

## **9.5 Admin — reviewing a reported article**

20. A Reader flags an article via "Report this article," selecting a reason.

21. Report enters the Admin moderation queue.

22. Admin reviews the article and report reason.

23. Admin actions the report: dismiss, unpublish, or suspend the Author, per T\&Cs.

# **10\. Out of Scope / Future Considerations (Phase 1\)**

* Direct-to-author payments (bypassing the Platform as intermediary).

* Multiple/tiered Platform subscription levels.

* Read-time-weighted revenue distribution for pooled subscriptions.

* AI-based automated pre-publish content review.

* Publications created by free (non-Pro) Authors.