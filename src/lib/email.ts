import type { users } from "../../drizzle/schema/users";

type User = typeof users.$inferSelect;

// Stub — real Resend implementation lands in Step 2.3
// (docs/04_MasterBuildGuide.md). For now, log so the signup flow is
// observable end-to-end without a working email provider.
export async function sendVerificationEmail(user: User): Promise<void> {
  console.log(`[stub] verification email would be sent to ${user.email} (user id ${user.id})`);
}
