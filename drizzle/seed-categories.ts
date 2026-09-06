import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories } from "./schema/categories";
import { slugify } from "../src/lib/slugify";

// Categories are Admin-managed only (Step 11's UI), but articles
// require one to publish (Step 4, this file's caller). With no Admin
// category-management UI built yet, a handful of starter categories
// are seeded here so Authors have real options before Step 11 lands —
// user-confirmed choice, see docs/06_ProjectState.md's Step 4 decision
// log. Safe to re-run: skips any category whose slug already exists.
const STARTER_CATEGORIES = [
  "Technology",
  "Culture",
  "Business",
  "Science",
  "Lifestyle",
  "Politics",
  "Health",
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema: { categories } });

  for (const name of STARTER_CATEGORIES) {
    const slug = slugify(name);
    await db
      .insert(categories)
      .values({ name, slug })
      .onConflictDoNothing({ target: categories.slug });
  }

  console.log(`Seeded ${STARTER_CATEGORIES.length} starter categories (skipping any that already exist).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
