import { verifyEmailAction } from "@/lib/actions/verify-email";
import { VerifyEmailClient } from "./VerifyEmailClient";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  if (!token) {
    return <VerifyEmailClient status="invalid" email={email} />;
  }

  const result = await verifyEmailAction(token);

  if (result.success) {
    return (
      <VerifyEmailClient
        status="success"
        email={result.email}
        autoLoginToken={result.autoLoginToken}
      />
    );
  }

  return <VerifyEmailClient status={result.error} email={email} />;
}
