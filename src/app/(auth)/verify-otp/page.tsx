import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { VerifyOtpClient } from "./VerifyOtpClient";

interface VerifyOtpPageProps {
  // Optional post-verification destination — used by the admin login
  // flow (src/app/admin-login/page.tsx) to land back on
  // /dashboard/admin instead of the public homepage. Only ever an
  // internal path (validated below), never taken as an open redirect.
  searchParams: Promise<{ next?: string }>;
}

export default async function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const session = await auth();
  const { next } = await searchParams;
  // Guard against an open-redirect: only allow a same-origin, absolute
  // path (must start with "/", never "//" which browsers treat as
  // protocol-relative to an external host).
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!session?.user) {
    redirect(safeNext === "/" ? "/" : `/admin-login`);
  }
  if (session.user.twoFactorVerified) {
    redirect(safeNext);
  }

  return <VerifyOtpClient redirectTo={safeNext} />;
}
