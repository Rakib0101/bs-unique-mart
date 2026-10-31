"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDhakaDateTime, formatPrice } from "@/lib/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { updateOrderStatusAction } from "@/app/admin/actions";
import type { Order, OrderStatus } from "@/lib/db/schema";

const STATUS_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // Calculate status counts for quick badges
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      if (c[o.status] !== undefined) c[o.status]++;
    }
    return c;
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Filter by search query
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((o) => {
        const idMatch = String(o.id).includes(q);
        const nameMatch = o.customerName.toLowerCase().includes(q);
        const phoneMatch = o.customerPhone.toLowerCase().includes(q);
        const productMatch = o.productTitle.toLowerCase().includes(q);
        const addressMatch = o.customerAddress.toLowerCase().includes(q);
        const sizeMatch = o.size?.toLowerCase().includes(q);
        const colorMatch = o.color?.toLowerCase().includes(q);
        return (
          idMatch ||
          nameMatch ||
          phoneMatch ||
          productMatch ||
          addressMatch ||
          sizeMatch ||
          colorMatch
        );
      });
    }

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "highest") {
        return b.totalPrice - a.totalPrice;
      }
      if (sortBy === "lowest") {
        return a.totalPrice - b.totalPrice;
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, search, sortBy]);

  // Reset to page 1 on filter or search change
  const handleFilterChange = (filter: OrderStatus | "all") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Filters Bar: Status Tabs + Search + Sort */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface-line bg-white p-4 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-line pb-3">
          {STATUS_FILTERS.map((f) => {
            const count = counts[f.key] ?? 0;
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => handleFilterChange(f.key)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-ink text-white shadow-xs"
                    : "text-ink/60 hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : f.key === "pending" && count > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-surface-muted text-ink/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls Row: Search Input, Sort Dropdown, Page Size */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by customer name, phone, order #..."
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-surface-line bg-surface-muted/30 pl-9 pr-8 py-2 text-xs font-medium text-ink placeholder:text-ink/40 outline-none focus:border-ink focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Page Size */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-ink/60">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-surface-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink outline-none focus:border-ink"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-ink/60">
              <span className="hidden sm:inline">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-surface-line bg-white px-2 py-1.5 text-xs font-medium text-ink outline-none focus:border-ink"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="overflow-hidden rounded-2xl border border-surface-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-surface-line bg-surface-muted/60 font-semibold text-ink/60 uppercase tracking-wider text-[11px]">
                <th className="whitespace-nowrap px-4 py-3.5">Order</th>
                <th className="whitespace-nowrap px-4 py-3.5">Date</th>
                <th className="whitespace-nowrap px-4 py-3.5">Customer</th>
                <th className="whitespace-nowrap px-4 py-3.5">Product & Details</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center">Qty</th>
                <th className="whitespace-nowrap px-4 py-3.5">Total Amount</th>
                <th className="whitespace-nowrap px-4 py-3.5">Status</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {paginatedOrders.map((order) => {
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-muted/40 transition-colors group"
                  >
                    {/* Order ID */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-bold text-ink">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-brand hover:underline font-bold"
                      >
                        #{order.id}
                      </Link>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-ink/60">
                      {formatDhakaDateTime(order.createdAt)}
                    </td>

                    {/* Customer Info */}
                    <td className="px-4 py-3.5">
                      <div className="min-w-[140px]">
                        <p className="font-bold text-ink leading-tight">{order.customerName}</p>
                        <p className="font-mono text-ink/50 text-[11px] mt-0.5">
                          {order.customerPhone}
                        </p>
                        <p
                          className="max-w-[200px] truncate text-[11px] text-ink/50 mt-0.5"
                          title={order.customerAddress}
                        >
                          {order.customerAddress}
                        </p>
                      </div>
                    </td>

                    {/* Product & Variant */}
                    <td className="px-4 py-3.5">
                      <div className="min-w-[160px]">
                        <p className="font-medium text-ink line-clamp-1">{order.productTitle}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink/60">
                          {order.size && (
                            <span className="rounded-md bg-surface-muted px-1.5 py-0.5 font-medium border border-surface-line">
                              Size: {order.size}
                            </span>
                          )}
                          {order.color && (
                            <span className="rounded-md bg-surface-muted px-1.5 py-0.5 font-medium border border-surface-line">
                              Color: {order.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-center font-bold text-ink">
                      {order.qty}
                    </td>

                    {/* Total Amount */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="font-bold text-ink text-sm">
                        {formatPrice(order.totalPrice)}
                      </span>
                      <p className="text-[10px] text-ink/40">
                        Charge: {formatPrice(order.deliveryCharge)}
                      </p>
                    </td>

                    {/* Status Select */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <OrderStatusSelect
                        status={order.status}
                        action={updateOrderStatusAction.bind(null, order.id)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-surface-line bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-muted hover:border-ink/20 transition-all"
                      >
                        <span>View</span>
                        <svg
                          className="h-3 w-3 text-ink/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="py-16 text-center px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-ink/40 mb-3">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-ink">No orders found</p>
            <p className="text-xs text-ink/50 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters or search keywords to find what you're looking for."
                : "No customer orders have been recorded yet."}
            </p>
            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="mt-4 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-ink/80 transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-line bg-surface-muted/30 px-4 py-3.5">
            {/* Status text */}
            <div className="text-xs text-ink/60">
              Showing <span className="font-bold text-ink">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-ink">{endIndex}</span> of{" "}
              <span className="font-bold text-ink">{filteredOrders.length}</span> orders
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* Previous button */}
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="flex h-8 items-center gap-1 rounded-xl border border-surface-line bg-white px-2.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // If lots of pages, show window around current
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - validCurrentPage) > 1
                  ) {
                    if (
                      (pageNum === 2 && validCurrentPage > 3) ||
                      (pageNum === totalPages - 1 && validCurrentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={pageNum} className="px-1 text-ink/30 text-xs">
                          &hellip;
                        </span>
                      );
                    }
                    return null;
                  }

                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`flex h-8 min-w-[32px] items-center justify-center rounded-xl px-2 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-ink text-white shadow-xs"
                          : "border border-surface-line bg-white text-ink/70 hover:bg-surface-muted hover:text-ink"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
                className="flex h-8 items-center gap-1 rounded-xl border border-surface-line bg-white px-2.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
