import { requireUser } from "@/lib/auth";
import { getAllOrders } from "@/lib/orders";
import OrdersTable from "@/components/admin/OrdersTable";

export default async function OrdersPage() {
  await requireUser();
  const allOrders = await getAllOrders();

  return (
    <div className="px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink">Orders Management</h1>
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-ink/60 border border-surface-line">
              {allOrders.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/60">
            Real-time orders placed across your storefront. Filter, update fulfillment status, and inspect customer details.
          </p>
        </div>
      </div>

      {/* Orders Table with Pagination & Live Filters */}
      <OrdersTable orders={allOrders} />
    </div>
  );
}
