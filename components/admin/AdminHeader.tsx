"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { formatPrice, formatTimeAgo } from "@/lib/format";
import type { Role } from "@/lib/db/schema";

export type HeaderNotification = {
  id: number;
  title: string;
  customerName: string;
  customerPhone: string;
  productTitle: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string | Date;
};

const STATUS_CONFIG: Record<
  HeaderNotification["status"],
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-blue-500/10 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-500/10 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export default function AdminHeader({
  username,
  role,
  initialNotifications = [],
  initialPendingCount = 0,
  onToggleSidebar,
}: {
  username: string;
  role: Role;
  initialNotifications?: HeaderNotification[];
  initialPendingCount?: number;
  onToggleSidebar?: () => void;
}) {
  const [notifications, setNotifications] = useState<HeaderNotification[]>(initialNotifications);
  const [pendingCount, setPendingCount] = useState<number>(initialPendingCount);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Initialize read timestamp from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_notif_last_read");
      if (stored) {
        setLastReadTimestamp(Number(stored));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Poll for live notifications every 30 seconds
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
          if (typeof data.pendingCount === "number") {
            setPendingCount(data.pendingCount);
          }
        }
      } catch (err) {
        console.error("Failed to poll notifications:", err);
      }
    }

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all as read handler
  const handleMarkAllRead = () => {
    const now = Date.now();
    setLastReadTimestamp(now);
    try {
      localStorage.setItem("admin_notif_last_read", String(now));
    } catch {
      // ignore
    }
  };

  // Filtered notifications
  const displayedNotifications =
    activeTab === "pending"
      ? notifications.filter((n) => n.status === "pending")
      : notifications;

  // Unread badge count: new notifications created after lastReadTimestamp, with min pending count
  const unreadCount = notifications.filter((n) => {
    const time = new Date(n.createdAt).getTime();
    return time > lastReadTimestamp || (n.status === "pending" && lastReadTimestamp === 0);
  }).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-line bg-white/95 px-4 backdrop-blur-md sm:px-8">
      {/* Left side: Hamburger toggle (mobile) & Store badge */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-ink/70 hover:bg-surface-muted hover:text-ink lg:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
            Store Live
          </span>
        </div>
      </div>

      {/* Right side: Quick links, Notifications icon, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* View Public Storefront link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-surface-line px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <span>Storefront</span>
          <svg className="h-3.5 w-3.5 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            aria-label="View notifications"
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              isNotifOpen
                ? "border-brand bg-brand/5 text-brand shadow-sm"
                : "border-surface-line bg-white text-ink/70 hover:border-ink/30 hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-surface-line bg-white shadow-2xl transition-all z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="border-b border-surface-line px-4 py-3 bg-surface-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-ink">Notifications</h3>
                    {pendingCount > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                        {pendingCount} pending
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-brand hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === "all"
                        ? "bg-ink text-white"
                        : "text-ink/60 hover:bg-surface-muted hover:text-ink"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("pending")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === "pending"
                        ? "bg-amber-600 text-white"
                        : "text-ink/60 hover:bg-surface-muted hover:text-ink"
                    }`}
                  >
                    Pending Orders ({pendingCount})
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-line">
                {displayedNotifications.length === 0 ? (
                  <div className="py-10 text-center px-4">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink/40 mb-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-ink">No notifications</p>
                    <p className="text-xs text-ink/50 mt-0.5">Everything is up to date.</p>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => {
                    const cfg = STATUS_CONFIG[notif.status] ?? STATUS_CONFIG.pending;
                    return (
                      <Link
                        key={notif.id}
                        href={`/admin/orders/${notif.id}`}
                        onClick={() => setIsNotifOpen(false)}
                        className="flex items-start gap-3 p-3.5 hover:bg-surface-muted/60 transition-colors group block"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted border border-surface-line text-ink/70 group-hover:border-ink/20">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-bold text-ink">
                              Order #{notif.id} &middot; {notif.customerName}
                            </p>
                            <span className="shrink-0 text-[11px] text-ink/40">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>

                          <p className="truncate text-xs text-ink/60 mt-0.5">
                            {notif.productTitle}
                          </p>

                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">
                              {formatPrice(notif.totalPrice)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${cfg.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-surface-line bg-surface-muted/30 p-2 text-center">
                <Link
                  href="/admin/orders"
                  onClick={() => setIsNotifOpen(false)}
                  className="block w-full rounded-lg py-1.5 text-xs font-bold text-brand hover:bg-brand/5 transition-colors"
                >
                  View all orders &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            aria-label="User profile menu"
            className={`flex items-center gap-2.5 rounded-xl border p-1.5 transition-all cursor-pointer ${
              isProfileOpen
                ? "border-ink bg-surface-muted"
                : "border-surface-line bg-white hover:border-ink/30 hover:bg-surface-muted"
            }`}
          >
            {/* User Avatar Circle */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#1f1f1f] to-[#3a3a3a] text-xs font-bold uppercase text-white shadow-inner">
              {username.slice(0, 2)}
            </div>

            <div className="hidden text-left sm:block pr-1">
              <p className="text-xs font-bold leading-tight text-ink">{username}</p>
              <p className="text-[10px] font-medium capitalize text-ink/50">{role}</p>
            </div>

            <svg
              className={`h-4 w-4 text-ink/40 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile Popover Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-surface-line bg-white shadow-2xl transition-all z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Header */}
              <div className="border-b border-surface-line bg-surface-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-sm font-bold uppercase text-white">
                    {username.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{username}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium capitalize text-ink/60">{role}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-2 space-y-0.5">
                <Link
                  href="/admin"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-surface-muted transition-colors"
                >
                  <svg className="h-4 w-4 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard Overview</span>
                </Link>

                <Link
                  href="/admin/products"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-surface-muted transition-colors"
                >
                  <svg className="h-4 w-4 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Products Management</span>
                </Link>

                <Link
                  href="/admin/orders"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-surface-muted transition-colors"
                >
                  <svg className="h-4 w-4 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Orders Table</span>
                </Link>

                {role === "admin" && (
                  <>
                    <Link
                      href="/admin/users"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-surface-muted transition-colors"
                    >
                      <svg className="h-4 w-4 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Manage Users</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-surface-muted transition-colors"
                    >
                      <svg className="h-4 w-4 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Store Settings</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Logout Button */}
              <div className="border-t border-surface-line p-2">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
