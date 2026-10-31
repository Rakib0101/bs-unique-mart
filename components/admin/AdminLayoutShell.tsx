"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader, { type HeaderNotification } from "./AdminHeader";
import type { Role } from "@/lib/db/schema";

export default function AdminLayoutShell({
  username,
  role,
  logoUrl,
  initialNotifications = [],
  pendingCount = 0,
  children,
}: {
  username: string;
  role: Role;
  logoUrl?: string;
  initialNotifications?: HeaderNotification[];
  pendingCount?: number;
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-muted flex">
      {/* Sidebar */}
      <AdminSidebar
        username={username}
        role={role}
        logoUrl={logoUrl}
        pendingCount={pendingCount}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        <AdminHeader
          username={username}
          role={role}
          initialNotifications={initialNotifications}
          initialPendingCount={pendingCount}
          onToggleSidebar={() => setIsMobileOpen((prev) => !prev)}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
