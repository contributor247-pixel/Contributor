"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { InviteResponseCard } from "@/components/publication/InviteResponseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { PendingInvite } from "@/lib/actions/publication";

export function InvitesList({ initialInvites }: { initialInvites: PendingInvite[] }) {
  const [invites, setInvites] = useState(initialInvites);

  if (invites.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        headline="No pending invites"
        description="Publication invites you receive will appear here."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {invites.map((invite) => (
        <li key={invite.id}>
          <InviteResponseCard invite={invite} onResponded={(id) => setInvites((prev) => prev.filter((i) => i.id !== id))} />
        </li>
      ))}
    </ul>
  );
}
