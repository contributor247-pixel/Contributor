"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Mail, UserCheck, UserX, ShieldAlert, CreditCard, type LucideIcon } from "lucide-react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/notifications";

interface NotificationRow {
  id: string;
  type: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}

const TYPE_ICON: Record<string, LucideIcon> = {
  publication_invite: Mail,
  invite_accepted: UserCheck,
  invite_declined: UserX,
  moderation_action: ShieldAlert,
  author_pro_activated: CreditCard,
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Polls for unread count on mount and refetches the list when opened —
// no real-time transport exists yet (out of scope per Step 13's "wire
// to existing events only" instruction), so this is a simple pull model
// good enough for a dashboard the user has open.
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getUnreadNotificationCount().then(setUnreadCount);
  }, []);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setIsLoading(true);
      getMyNotifications(10).then((rows) => {
        setItems(rows);
        setIsLoading(false);
      });
    }
  };

  const handleItemClick = (item: NotificationRow) => {
    if (!item.isRead) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      startTransition(() => {
        markNotificationReadAction(item.id);
      });
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        onClick={handleToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-[4px] text-text-body transition-colors hover:bg-bg-muted sm:h-9 sm:w-9"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-[4px] border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-text-heading">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="text-xs font-medium text-text-muted hover:text-text-body disabled:opacity-60"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-full rounded bg-bg-muted" />
                        <div className="h-3 w-2/3 rounded bg-bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-text-muted">You&apos;re all caught up.</p>
              ) : (
                <ul>
                  {items.map((item) => {
                    const Icon = TYPE_ICON[item.type] ?? Bell;
                    const row = (
                      <div
                        className={
                          item.isRead
                            ? "flex gap-3 px-4 py-3 transition-colors hover:bg-bg-muted"
                            : "flex gap-3 bg-primary-subtle/40 px-4 py-3 transition-colors hover:bg-primary-subtle/60"
                        }
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug text-text-body">{item.message}</p>
                          <p className="mt-0.5 text-xs text-text-muted">{timeAgo(item.createdAt)}</p>
                        </div>
                        {!item.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        )}
                      </div>
                    );
                    return (
                      <li key={item.id} className="border-b border-border last:border-0">
                        {item.linkUrl ? (
                          <Link href={item.linkUrl} onClick={() => handleItemClick(item)}>
                            {row}
                          </Link>
                        ) : (
                          <button type="button" onClick={() => handleItemClick(item)} className="block w-full text-left">
                            {row}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
