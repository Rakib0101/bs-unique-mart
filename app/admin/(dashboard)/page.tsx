import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getOrderStats } from "@/lib/orders";
import { getAllProducts } from "@/lib/products";
import { formatDhakaDateTime, formatPrice } from "@/lib/format";
import StatTile from "@/components/admin/StatTile";
import OrdersBarChart from "@/components/admin/OrdersBarChart";
import OrderStatusDonut from "@/components/admin/OrderStatusDonut";
import FulfillmentMeter from "@/components/admin/FulfillmentMeter";

const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-500/10 text-blue-700 border border-blue-200",
  delivered: "bg-emerald-500/10 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-500/10 text-red-700 border border-red-200",
};

export default async function AdminOverviewPage() {
  await requireUser();

  const [stats, allProducts] = await Promise.all([getOrderStats(14), getAllProducts()]);

  return (
    <div className="px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">Dashboard Overview</h1>
          <p className="mt-1 text-xs text-ink/60">
            Real-time performance summary, revenue, order fulfillment, and recent storefront sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl border border-surface-line bg-white px-3 py-2 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-muted transition-all"
          >
            <span>+ Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-ink/80 transition-all"
          >
            <span>Manage Orders</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stat Tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Total Orders" value={String(stats.totalOrders)} />
          <StatTile
            label="Delivered Revenue"
            value={formatPrice(stats.totalRevenue)}
            sublabel="from completed COD orders"
          />
          <StatTile
            label="Pending Orders"
            value={String(stats.statusCounts.pending)}
            sublabel="awaiting confirmation"
          />
          <StatTile
            label="Active Products"
            value={String(allProducts.length)}
            sublabel="catalog items"
          />
        </div>

        {/* Charts & Fulfillment Meters */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrdersBarChart data={stats.dailyOrders} />
          </div>
          <div className="space-y-6">
            <FulfillmentMeter
              delivered={stats.statusCounts.delivered}
              total={stats.totalOrders}
            />
            <OrderStatusDonut counts={stats.statusCounts} />
          </div>
        </div>

        {/* Recent Orders Card */}
        <section className="rounded-2xl border border-surface-line bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-surface-line pb-3">
            <div>
              <p className="text-sm font-bold text-ink">Recent Storefront Orders</p>
              <p className="text-xs text-ink/50 mt-0.5">Latest customer purchases awaiting or completing fulfillment</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
            >
              <span>View full table ({stats.totalOrders})</span>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="py-12 text-center text-xs text-ink/50">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-surface-line">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 py-3 hover:bg-surface-muted/60 transition-colors rounded-xl px-2.5 -mx-2.5 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">#{order.id}</span>
                      <p className="truncate text-xs font-bold text-ink">{order.productTitle}</p>
                    </div>
                    <p className="truncate text-[11px] text-ink/50 mt-0.5">
                      {order.customerName} &middot; {order.customerPhone} &middot;{" "}
                      {formatDhakaDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_PILL[order.status] ?? ""}`}
                    >
                      {order.status}
                    </span>
                    <span className="shrink-0 text-xs font-bold text-ink min-w-[70px] text-right">
                      {formatPrice(order.totalPrice)}
                    </span>
                    <svg
                      className="h-4 w-4 text-ink/30 group-hover:text-ink transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
