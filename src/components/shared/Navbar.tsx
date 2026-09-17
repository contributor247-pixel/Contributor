"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Search, ShoppingBag, User, LogOut, PenSquare, Sparkles } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useSearchOverlay } from "@/hooks/use-search-overlay";

// Reader-facing nav copy
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/content", label: "Browse" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const QUICK_TOPICS = [
  { label: "Culture", href: "/content/culture" },
  { label: "Technology", href: "/content/technology" },
  { label: "Business", href: "/content/business" },
  { label: "Science", href: "/content/science" },
];

function initials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || parts[0]?.[0]?.toUpperCase() || "?";
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

function dashboardHrefForRole(role: "reader" | "author" | "admin" | undefined): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "author") return "/dashboard/author";
  return "/dashboard/reader";
}

export function Navbar() {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const isCurrent = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: session, status } = useSession();
  const { open } = useAuthModal();
  const { open: openSearch } = useSearchOverlay();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = drawerRef.current;
    const focusable = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") ?? []);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      menuTriggerRef.current?.focus();
    };
  }, [isDrawerOpen]);

  // Global shortcut (⌘K or Ctrl+K) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  return (
    <>
      {/* Top Editorial Dispatch Ribbon */}
      <aside
        aria-label="Editorial edition ribbon"
        className="hidden border-b border-white/[0.07] bg-ink-soft text-[11px] text-white/70 sm:block"
      >
        <div className="mx-auto flex h-8 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-supportive shadow-[0_0_8px_var(--color-supportive)]" />
            </span>
            <span className="font-semibold uppercase tracking-[0.16em] text-supportive-subtle">
              Daily Dispatch
            </span>
            <span className="text-white/30" aria-hidden="true">&bull;</span>
            <span className="text-white/60">
              Curated independent journalism &amp; longform thought
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/60">
            <span className="hidden md:inline">100% Creator-Powered &bull; Zero Platform Ads</span>
            <Link
              href="/dashboard/author/articles/new"
              className="group inline-flex items-center gap-1 font-medium text-white/80 transition-colors hover:text-supportive-subtle"
            >
              <Sparkles className="h-3 w-3 text-supportive transition-transform group-hover:rotate-12" aria-hidden="true" />
              <span>Earn as a Writer</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Sticky Navbar */}
      <header
        data-dark-surface
        className={[
          "sticky top-0 z-40 bg-ink/95 backdrop-blur-md transition-all duration-300",
          isScrolled
            ? "border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
            : "border-b border-white/[0.06]",
        ].join(" ")}
      >
        {/* Subtle accent border line */}
        <div
          aria-hidden="true"
          className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        />

        <div className="mx-auto flex h-18 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              ref={menuTriggerRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition-all hover:border-white/30 hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link href="/" className="group flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ */}
              <img
                src="/logo/logo-dark.png"
                alt="Contributor"
                className="h-11 w-auto transition-transform duration-200 group-hover:scale-[1.02] sm:h-13"
              />
              <span className="hidden border-l border-white/15 pl-3 text-xs font-serif italic tracking-wide text-white/50 lg:inline">
                The Discovery Journal
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const active = isCurrent(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative flex min-h-11 items-center px-4 text-sm font-medium transition-all duration-200 rounded-full",
                    active
                      ? "text-white bg-white/[0.08]"
                      : "text-white/70 hover:text-white hover:bg-white/[0.04]",
                  ].join(" ")}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-1 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-primary to-supportive"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search Shortcut, Write CTA, Purchases, User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Trigger Pill */}
            <button
              type="button"
              aria-label="Search stories (Press Cmd+K or Ctrl+K)"
              onClick={openSearch}
              className="flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 text-xs text-white/80 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white sm:h-10 sm:px-4"
            >
              <Search className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
              <span className="hidden sm:inline">Search stories...</span>
              <kbd className="hidden rounded-full border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70 md:inline-block">
                ⌘K
              </kbd>
            </button>

            {/* Distinctive Write CTA */}
            <Link
              href="/dashboard/author/articles/new"
              className="hidden items-center gap-1.5 rounded-full border border-primary/70 bg-gradient-to-r from-primary/35 to-primary/15 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:border-primary hover:bg-primary/45 hover:shadow-[0_0_16px_rgba(139,30,63,0.4)] sm:inline-flex"
            >
              <PenSquare className="h-3.5 w-3.5 text-supportive-subtle" aria-hidden="true" />
              <span>Write</span>
            </Link>

            {/* Authenticated Purchases */}
            {status === "authenticated" && (
              <Link
                href="/dashboard/reader/purchases"
                aria-label="Your purchases"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}

            {/* User Account / Sign In */}
            {status === "authenticated" ? (
              <div className="group relative">
                <button
                  type="button"
                  aria-label={`Account menu, ${initials(session.user?.name, session.user?.email)}`}
                  title={session.user?.name ?? session.user?.email ?? "Account"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] transition-all hover:border-white/30 hover:bg-white/10 sm:h-10 sm:w-10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-bold text-white ring-1 ring-white/20 sm:h-8 sm:w-8">
                    {initials(session.user?.name, session.user?.email)}
                  </span>
                </button>
                <div className="invisible absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/90 bg-surface py-1.5 opacity-0 shadow-2xl transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="border-b border-border/80 px-4 py-2.5">
                    <p className="text-xs font-semibold text-text-heading">
                      {session.user?.name ?? "Subscriber"}
                    </p>
                    <p className="truncate text-xs text-text-muted">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard/reader"
                    className="block px-4 py-2 text-xs font-medium text-text-body transition-colors hover:bg-bg-muted hover:text-primary"
                  >
                    Reader Dashboard
                  </Link>
                  <Link
                    href="/dashboard/author"
                    className="block px-4 py-2 text-xs font-medium text-text-body transition-colors hover:bg-bg-muted hover:text-primary"
                  >
                    Author Studio
                  </Link>
                  <Link
                    href="/dashboard/reader/settings"
                    className="block px-4 py-2 text-xs font-medium text-text-body transition-colors hover:bg-bg-muted"
                  >
                    Settings
                  </Link>
                  <div className="my-1 border-t border-border/80" />
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-error hover:bg-error/10"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => open("login")}
                className="flex h-11 items-center gap-1.5 rounded-full border border-white/20 bg-white px-4 text-xs font-semibold text-ink shadow-xs transition-all hover:bg-white/90 hover:shadow-md sm:h-10 sm:px-5"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-overlay-scrim/80 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              ref={drawerRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
              data-dark-surface
              className="fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-sm flex-col overflow-y-auto overscroll-contain rounded-r-2xl border-r border-white/15 bg-ink px-6 py-6 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ */}
                <img src="/logo/logo-dark.png" alt="Contributor" className="h-10 w-auto" />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openSearch();
                }}
                className="mb-6 flex h-11 w-full items-center gap-3 rounded-full border border-white/20 bg-white/[0.06] px-4 text-sm text-white/80 transition-colors hover:border-white/40 hover:bg-white/10"
              >
                <Search className="h-4 w-4 text-supportive" aria-hidden="true" />
                <span>Search all stories...</span>
              </button>

              <nav className="flex flex-col" aria-label="Primary mobile">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Navigation
                </p>
                {NAV_LINKS.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    onClick={() => setIsDrawerOpen(false)}
                    className="group flex items-center justify-between border-b border-white/[0.08] py-3.5 text-base text-white/80 transition-colors hover:text-white aria-[current=page]:font-semibold aria-[current=page]:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-serif text-xs text-white/50 group-hover:text-supportive">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {link.label}
                    </span>
                    <span className="text-white/50 transition-transform group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Quick Topics */}
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Trending Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TOPICS.map((topic) => (
                    <Link
                      key={topic.href}
                      href={topic.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/80 transition-colors hover:border-primary hover:bg-primary/20 hover:text-white"
                    >
                      {topic.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Auth Actions */}
              <div className="mt-auto pt-6">
                {status === "authenticated" ? (
                  <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
                    <p className="mb-1 text-xs font-medium text-white/90">{session?.user?.name ?? "Account"}</p>
                    <p className="mb-3 truncate text-xs text-white/50">{session?.user?.email}</p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={dashboardHrefForRole(session?.user?.role)}
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex h-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          signOut();
                        }}
                        className="flex h-9 items-center justify-center gap-2 rounded-full border border-white/20 text-xs font-medium text-white/80 transition-colors hover:border-white/40 hover:bg-white/10"
                      >
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        open("login");
                      }}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white text-sm font-semibold text-ink shadow-md transition-transform hover:scale-[1.01]"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      Sign in to Contributor
                    </button>
                    <Link
                      href="/dashboard/author/articles/new"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/60 bg-primary/30 text-xs font-semibold text-white transition-colors hover:border-primary-hover hover:bg-primary/40"
                    >
                      <PenSquare className="h-3.5 w-3.5 text-supportive-subtle" aria-hidden="true" />
                      Start Writing Today
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

