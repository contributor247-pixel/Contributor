import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

// Single-use, short-lived token exchanged for a real session
// immediately after a visitor clicks their email verification link —
// docs/01_ApplicationFlow.md Flow A step 6 requires "auto-logged in as
// Reader" right after verification, not a second manual sign-in. The
// Credentials provider's authorize() needs a password, which isn't
// available at verification time (only the hash is stored), so this
// is a narrow, separate one-time credential: minted by
// verifyEmailAction only on a successful verification, consumed by
// exactly one signIn() call, and expired after 60 seconds — enough
// for the immediate client-side redirect this flow does, not a
// general-purpose passwordless login mechanism.
export const autoLoginTokens = pgTable("auto_login_tokens", {
  token: text("token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
