import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLoginClient } from "./AdminLoginClient";

// Deliberately outside every route group — no public Navbar/Footer,
// no signup link, nothing shared with the Reader/Author AuthModal.
// Per explicit request: the owner's entry point into /dashboard/admin
// should look and feel entirely separate from the normal site login,
// even though it authenticates through the same Credentials provider
// + email-OTP 2FA underneath (src/lib/auth.ts) rather than a different
// mechanism — reusing what's already built and tested end to end.
export default async function AdminLoginPage() {
  const session = await auth();

  // Already a fully-verified admin session — no need to log in again.
  if (session?.user?.role === "admin" && session.user.twoFactorVerified) {
    redirect("/dashboard/admin");
  }
  // Mid-way through 2FA (already submitted credentials, OTP pending).
  if (session?.user?.role === "admin" && !session.user.twoFactorVerified) {
    redirect("/verify-otp?next=/dashboard/admin");
  }

  return <AdminLoginClient />;
}
