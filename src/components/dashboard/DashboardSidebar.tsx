"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutGrid,
  FileText,
  BookOpen,
  Mail,
  CreditCard,
  Settings,
  ShoppingBag,
  Users,
  ShieldAlert,
  Percent,
  Tags,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const READER_NAV: NavItem[] = [
  { href: "/dashboard/reader", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/reader/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/dashboard/reader/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/dashboard/reader/settings", label: "Settings", icon: Settings },
];

const AUTHOR_NAV: NavItem[] = [
  { href: "/dashboard/author", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/author/articles", label: "My Articles", icon: FileText },
  { href: "/dashboard/author/publications", label: "Publications", icon: BookOpen },
  { href: "/dashboard/author/invites", label: "Invites", icon: Mail },
  { href: "/dashboard/author/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/author/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { href: "/dashboard/admin/settings/fees", label: "Fee Settings", icon: Percent },
  { href: "/dashboard/admin/settings/categories", label: "Categories", icon: Tags },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  author: "Author",
  reader: "Reader",
};

// Chooses the nav set from the session's role rather than the current
// URL, since a Publication Owner viewing /dashboard/reader (e.g. their
// own reading purchases) should still see Author nav, not have it
// swapped based on which section they're currently in.
export function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Derive the nav set from the URL first — every dashboard route is
  // already namespaced (/dashboard/admin/**, /dashboard/author/**,
  // /dashboard/reader/**) — rather than from the session's role. The
  // session role is only a fallback for the bare /dashboard path,
  // since relying on useSession() as the primary source flashes the
  // wrong nav (defaulting to Reader) for a beat on every fresh page
  // load while the session is still hydrating client-side.
  const pathRole = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/author")
      ? "author"
      : pathname.startsWith("/dashboard/reader")
        ? "reader"
        : null;
  const role = pathRole ?? session?.user.role ?? "reader";
  const navItems = role === "admin" ? ADMIN_NAV : role === "author" ? AUTHOR_NAV : READER_NAV;

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
        data-dark-surface
        className={[
          "z-40 flex w-64 shrink-0 flex-col bg-ink",
          "fixed inset-y-0 left-0 transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="px-5 pb-4 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {ROLE_LABEL[role]} Dashboard
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Dashboard">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "group relative flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-white/[0.08] font-medium text-white"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white/90",
                ].join(" ")}
              >
                {isActive && (
                  <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-primary" aria-hidden="true" />
                )}
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
