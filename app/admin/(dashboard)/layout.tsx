import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([requireUser(), getSiteSettings()]);

  let initialNotifications: {
    id: number;
    title: string;
    customerName: string;
    customerPhone: string;
    productTitle: string;
    totalPrice: number;
    status: "pending" | "confirmed" | "delivered" | "cancelled";
    createdAt: string;
  }[] = [];
  let pendingCount = 0;

  try {
    const db = getDb();
    const [recentOrders, pendingOrders] = await Promise.all([
      db
        .select({
          id: orders.id,
          productTitle: orders.productTitle,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          totalPrice: orders.totalPrice,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(10),
      db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.status, "pending")),
    ]);

    initialNotifications = recentOrders.map((o) => ({
      id: o.id,
      title: `Order #${o.id}`,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      productTitle: o.productTitle,
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));
    pendingCount = pendingOrders.length;
  } catch (err) {
    console.error("Failed to load initial layout notifications:", err);
  }

  return (
    <AdminLayoutShell
      username={session.username}
      role={session.role}
      logoUrl={settings.logoUrl}
      initialNotifications={initialNotifications}
      pendingCount={pendingCount}
    >
      {children}
    </AdminLayoutShell>
  );
}
