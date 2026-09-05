import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { VerifyOtpClient } from "./VerifyOtpClient";

export default async function VerifyOtpPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }
  if (session.user.twoFactorVerified) {
    redirect("/");
  }

  return <VerifyOtpClient />;
}
