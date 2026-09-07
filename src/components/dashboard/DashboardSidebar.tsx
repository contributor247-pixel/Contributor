"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
}

const READER_NAV: NavItem[] = [
  { href: "/dashboard/reader", label: "Overview" },
  { href: "/dashboard/reader/purchases", label: "Purchases" },
  { href: "/dashboard/reader/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/reader/settings", label: "Settings" },
];

const AUTHOR_NAV: NavItem[] = [
  { href: "/dashboard/author", label: "Overview" },
  { href: "/dashboard/author/articles", label: "My Articles" },
  { href: "/dashboard/author/publications", label: "Publications" },
  { href: "/dashboard/author/invites", label: "Invites" },
  { href: "/dashboard/author/billing", label: "Billing" },
  { href: "/dashboard/author/settings", label: "Settings" },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/moderation", label: "Moderation" },
  { href: "/dashboard/admin/settings/fees", label: "Fee Settings" },
  { href: "/dashboard/admin/settings/categories", label: "Categories" },
];

// Basic functional shell for Step 3 — full visual polish lands in Step
// 15. Chooses the nav set from the session's role rather than the
// current URL, since a Publication Owner viewing /dashboard/reader
// (e.g. their own reading purchases) should still see Author nav, not
// have it swapped based on which section they're currently in.
export function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems =
    session?.user.role === "admin"
      ? ADMIN_NAV
      : session?.user.role === "author"
        ? AUTHOR_NAV
        : READER_NAV;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-overlay-scrim lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={[
          "z-40 w-64 shrink-0 border-r border-border bg-surface",
          "fixed inset-y-0 left-0 transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <nav className="flex flex-col gap-1 p-4" aria-label="Dashboard">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "rounded-[4px] px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-bg-muted font-medium text-text-heading"
                    : "text-text-body hover:bg-bg-muted",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
