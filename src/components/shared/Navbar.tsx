"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Search, ShoppingBag, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useSearchOverlay } from "@/hooks/use-search-overlay";

// Reader-facing nav copy — avoid internal/CMS terms like "Content
// Listing" or "Create Content" that describe the system rather than
// what a visitor is actually doing.
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/content", label: "Browse" },
  { href: "/dashboard/author/articles/new", label: "Write" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Same convention as DashboardTopbar's avatar — kept identical so a
// logged-in user sees the same visual identity treatment across both
// the marketing site and the dashboard.
function initials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || parts[0]?.[0]?.toUpperCase() || "?";
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: session, status } = useSession();
  const { open } = useAuthModal();
  const { open: openSearch } = useSearchOverlay();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  return (
    <>
      <header
        data-dark-surface
        className={[
          "sticky top-0 z-40 bg-ink transition-shadow duration-200",
          isScrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.25)] backdrop-blur-sm" : "",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link
              href="/"
              className="font-serif text-xl font-semibold text-white"
            >
              Contributor
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/85 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={openSearch}
              className="flex h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
            {status === "authenticated" && (
              <Link
                href="/dashboard/reader/purchases"
                aria-label="Purchases"
                className="hidden h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10 sm:flex"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}

            {status === "authenticated" ? (
              <div className="group relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex h-10 w-10 items-center justify-center rounded-[4px] transition-colors hover:bg-white/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                    {initials(session.user?.name, session.user?.email)}
                  </span>
                </button>
                <div className="invisible absolute right-0 top-full w-48 rounded-[4px] border border-border bg-surface py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <p className="truncate px-4 py-2 text-xs text-text-muted">
                    {session.user?.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="block w-full px-4 py-2 text-left text-sm text-text-body hover:bg-bg-muted"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Login"
                onClick={() => open("login")}
                className="flex h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10"
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-overlay-scrim lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              data-dark-surface
              className="fixed inset-y-0 left-0 z-50 flex w-[80vw] max-w-xs flex-col bg-ink px-6 py-6 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-serif text-lg font-semibold text-white">
                  Contributor
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col" aria-label="Primary mobile">
                {NAV_LINKS.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="group flex items-center gap-4 border-b border-white/10 py-4 text-base text-white/90 transition-colors first:border-t hover:text-white"
                  >
                    <span className="font-serif text-xs text-white/40 transition-colors group-hover:text-primary-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    openSearch();
                  }}
                  className="group flex items-center gap-4 border-b border-white/10 py-4 text-base text-white/90 transition-colors hover:text-white"
                >
                  <Search className="h-4 w-4 text-white/40 transition-colors group-hover:text-primary-subtle" aria-hidden="true" />
                  Search
                </button>
              </nav>

              <div className="mt-auto pt-6">
                {status === "authenticated" ? (
                  <>
                    <p className="mb-3 truncate text-xs text-white/50">{session?.user?.email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        signOut();
                      }}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-white/15 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      open("login");
                    }}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-white text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    Sign in
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
