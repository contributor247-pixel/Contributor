"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "../../../drizzle/schema/index";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";
import { sendVerificationEmail } from "@/lib/email";

export type SignupResult =
  | { success: true }
  | { success: false; error: string };

export async function signupAction(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password, role } = parsed.data;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role,
      emailVerified: null,
    })
    .returning();

  await sendVerificationEmail(user);

  return { success: true };
}
