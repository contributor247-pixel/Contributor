import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { publications } from "./publications";
import { tags } from "./tags";

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "published",
  "unpublished",
]);

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  body: jsonb("body").notNull(),
  excerpt: text("excerpt"),
  coverImageUrl: text("cover_image_url"),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  publicationId: uuid("publication_id").references(() => publications.id),
  isPremium: boolean("is_premium").notNull().default(false),
  priceCents: integer("price_cents"),
  status: articleStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { mode: "date" }),
});

// Supports joint authorship: multiple rows per article, all
// revenue-share-exempt per docs/00_ScopeDocument.md Section 7.1.
export const articleAuthors = pgTable(
  "article_authors",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.userId] })]
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.tagId] })]
);
