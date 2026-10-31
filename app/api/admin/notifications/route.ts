import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Fetch the 15 most recent orders for live notifications
    const recentOrders = await db
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
      .limit(15);

    // Count pending orders
    const pendingCountResult = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const pendingCount = pendingCountResult.length;

    return NextResponse.json({
      pendingCount,
      notifications: recentOrders.map((order) => ({
        id: order.id,
        title: `Order #${order.id}`,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        productTitle: order.productTitle,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch admin notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
