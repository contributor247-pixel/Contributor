import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users } from "./schema/users";

// Out-of-band CLI script for provisioning the first (or an additional)
// Platform Admin account — docs/00_ScopeDocument.md Section 2 says
// Admin is "not self-registerable — seeded/promoted manually," but no
// mechanism actually existed to do that: signupAction's schema only
// allows role reader/author, and an earlier debug HTTP route for this
// (zzseedadmin) was removed from source at some point, leaving no
// working path at all. This is a script, not an HTTP route,
// deliberately — an admin-provisioning endpoint left reachable in
// production is exactly the kind of accidental exposure an app
// route shouldn't risk; a script only ever runs where someone already
// has direct database/deploy access.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... ADMIN_NAME="Jane Doe" npm run db:seed-admin
//
// emailVerified is set immediately and 2FA is left at its normal
// per-login OTP requirement (auth.ts fires OTP for role "admin" on
// every sign-in, same as Authors) — this script only bootstraps the
// account record, it doesn't bypass the login security model.
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || null;

  if (!email || !password) {
    console.error(
      "Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... [ADMIN_NAME=\"Jane Doe\"] npm run db:seed-admin"
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    if (existing.role === "admin") {
      console.log(`An admin account already exists for ${email} (id: ${existing.id}) — nothing to do.`);
      return;
    }
    console.error(
      `An account already exists for ${email} with role "${existing.role}". ` +
        "This script only creates new admin accounts — promote an existing user " +
        "by updating its role/passwordHash directly if that's what you intend."
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [admin] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      role: "admin",
      emailVerified: new Date(),
    })
    .returning({ id: users.id, email: users.email });

  console.log(`Created admin account ${admin.email} (id: ${admin.id}).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
