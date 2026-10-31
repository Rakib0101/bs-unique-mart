"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import type { Role } from "@/lib/db/schema";

type NavItem = {
  href: string;
  label: string;
  exact: boolean;
  adminOnly: boolean;
  icon: (active: boolean) => React.ReactNode;
  badge?: (pendingCount?: number) => React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    adminOnly: false,
    icon: (active) => (
      <svg
        className={`h-4 w-4 ${active ? "text-white" : "text-ink/60"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    exact: true,
    adminOnly: false,
    icon: (active) => (
      <svg
        className={`h-4 w-4 ${active ? "text-white" : "text-ink/60"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    href: "/admin/products/new",
    label: "Add Product",
    exact: true,
    adminOnly: false,
    icon: (active) => (
      <svg
        className={`h-4 w-4 ${active ? "text-white" : "text-ink/60"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    exact: false,
    adminOnly: false,
    icon: (active) => (
      <svg
        className={`h-4 w-4 ${active ? "text-white" : "text-ink/60"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    badge: (pending) =>
      pending && pending > 0 ? (
        <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
          {pending}
        </span>
      ) : null,
  },
  {
    href: "/admin/users",
    label: "Users",
    exact: false,
    adminOnly: true,
    icon: (active) => (
      <svg
        className={`h-4 w-4 ${active ? "text-white" : "text-ink/60"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    exact: false,
    adminOnly: true,
    icon: (active) => (
      <svg
        className={`h-4 w-4 ${active ? "text-white" : "text-ink/60"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({
  username,
  role,
  logoUrl,
  pendingCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}: {
  username: string;
  role: Role;
  logoUrl?: string;
  pendingCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Drawer / Fixed Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-surface-line bg-white transition-transform duration-200 ease-in-out lg:z-20 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-surface-line px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src={logoUrl || "/images/BS_Unique_Mart_Logo.png"}
              alt="BS Unique Mart"
              width={36}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-ink leading-tight">
                Unique Mart
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40">
                Dashboard
              </span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-surface-muted hover:text-ink lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink/40">
            Main Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin").map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-ink text-white shadow-xs"
                      : "text-ink/70 hover:bg-surface-muted hover:text-ink"
                  }`}
                >
                  {item.icon(active)}
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? item.badge(pendingCount) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="border-t border-surface-line p-3 bg-surface-muted/30">
          <div className="flex items-center gap-3 rounded-xl p-2 bg-white border border-surface-line shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-bold text-white uppercase">
              {username.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-ink">{username}</p>
              <p className="text-[10px] font-medium capitalize text-ink/50">{role}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Log out"
                aria-label="Log out"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/40 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
