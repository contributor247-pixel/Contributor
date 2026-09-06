"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "../../../drizzle/schema/index";

export async function getPublishableCategoriesAction() {
  return db.select().from(categories).where(eq(categories.deprecated, false)).orderBy(categories.name);
}
