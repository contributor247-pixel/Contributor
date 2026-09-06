"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Search, ShoppingBag, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";

const NAV_LINKS = [
  { href: "/", label: "Homepage" },
  { href: "/content", label: "Content Listing" },
  { href: "/dashboard/author/articles/new", label: "Create Content" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: session, status } = useSession();
  const { open } = useAuthModal();
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
              className="flex h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Purchases"
              className="hidden h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10 sm:flex"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </button>

            {status === "authenticated" ? (
              <div className="group relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex h-10 w-10 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
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
              <nav className="flex flex-col gap-1" aria-label="Primary mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-[4px] px-2 py-3 text-base text-white/90 transition-colors hover:bg-white/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
