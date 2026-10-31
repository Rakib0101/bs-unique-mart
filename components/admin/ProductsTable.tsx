"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { deleteProductAction, setFlagshipAction } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import type { Product } from "@/lib/db/schema";

function getProductUrl(product: Pick<Product, "slug" | "isFlagship">) {
  return product.isFlagship ? "/" : `/products/${product.slug}`;
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [flagshipFilter, setFlagshipFilter] = useState<"all" | "flagship" | "regular">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-desc" | "price-asc">("newest");

  // Counts
  const counts = useMemo(() => {
    return {
      all: products.length,
      flagship: products.filter((p) => p.isFlagship).length,
      regular: products.filter((p) => !p.isFlagship).length,
    };
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = products;

    if (flagshipFilter === "flagship") {
      result = result.filter((p) => p.isFlagship);
    } else if (flagshipFilter === "regular") {
      result = result.filter((p) => !p.isFlagship);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const slugMatch = p.slug.toLowerCase().includes(q);
        const subtitleMatch = p.subtitle?.toLowerCase().includes(q);
        return titleMatch || slugMatch || subtitleMatch;
      });
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      return 0;
    });

    return result;
  }, [products, flagshipFilter, search, sortBy]);

  const handleFilterChange = (val: "all" | "flagship" | "regular") => {
    setFlagshipFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-surface-line bg-white p-4 shadow-xs">
        {/* Flagship Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-line pb-3">
          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              flagshipFilter === "all"
                ? "bg-ink text-white shadow-xs"
                : "text-ink/60 hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span>All Products</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                flagshipFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-surface-muted text-ink/60"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("flagship")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              flagshipFilter === "flagship"
                ? "bg-brand text-white shadow-xs"
                : "text-ink/60 hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span>Flagship</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                flagshipFilter === "flagship"
                  ? "bg-white/20 text-white"
                  : "bg-brand/10 text-brand"
              }`}
            >
              {counts.flagship}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("regular")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              flagshipFilter === "regular"
                ? "bg-ink text-white shadow-xs"
                : "text-ink/60 hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span>Regular</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                flagshipFilter === "regular"
                  ? "bg-white/20 text-white"
                  : "bg-surface-muted text-ink/60"
              }`}
            >
              {counts.regular}
            </span>
          </button>
        </div>

        {/* Search & Sort Controls */}
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
              placeholder="Search products by title or slug..."
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

          {/* Sort & Page Size Controls */}
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
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
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

      {/* Products Table Container */}
      <div className="overflow-hidden rounded-2xl border border-surface-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-surface-line bg-surface-muted/60 font-semibold text-ink/60 uppercase tracking-wider text-[11px]">
                <th className="whitespace-nowrap px-4 py-3.5">Product</th>
                <th className="whitespace-nowrap px-4 py-3.5">Pricing</th>
                <th className="whitespace-nowrap px-4 py-3.5">Variants</th>
                <th className="whitespace-nowrap px-4 py-3.5">Rating</th>
                <th className="whitespace-nowrap px-4 py-3.5">Flagship</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {paginatedProducts.map((product) => {
                const savings = product.comparePrice ? product.comparePrice - product.price : 0;
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-muted/40 transition-colors group"
                  >
                    {/* Product info with thumbnail */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-surface-line bg-surface-muted shadow-2xs">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink/30 text-[10px]">
                              No img
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-bold text-ink hover:text-brand transition-colors line-clamp-1"
                            >
                              {product.title}
                            </Link>
                            {product.isFlagship && (
                              <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand border border-brand/20">
                                Flagship
                              </span>
                            )}
                          </div>
                          <a
                            href={getProductUrl(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink/40 hover:text-brand hover:underline font-mono"
                          >
                            <span>/{product.slug}</span>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-ink text-sm">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-ink/40 line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                            {savings > 0 && (
                              <span className="rounded bg-emerald-50 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
                                Save {formatPrice(savings)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Variants */}
                    <td className="px-4 py-3.5">
                      <div className="min-w-[140px] space-y-1">
                        {/* Colors */}
                        {product.colors && product.colors.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-ink/40">Colors:</span>
                            <div className="flex -space-x-1 overflow-hidden">
                              {product.colors.map((c, i) => (
                                <span
                                  key={i}
                                  title={c.name}
                                  className="inline-block h-3.5 w-3.5 rounded-full border border-white shadow-2xs"
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-ink/50 ml-1">
                              ({product.colors.length})
                            </span>
                          </div>
                        ) : null}

                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink/70 border border-surface-line"
                              >
                                {s}
                              </span>
                            ))}
                            {product.sizes.length > 4 && (
                              <span className="text-[10px] text-ink/40">
                                +{product.sizes.length - 4}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink/30">—</span>
                        )}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-ink">{product.ratingValue}</span>
                        <svg className="h-3.5 w-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[10px] text-ink/40">
                          ({product.ratingCount})
                        </span>
                      </div>
                    </td>

                    {/* Flagship Toggle */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {product.isFlagship ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Home Main
                        </span>
                      ) : (
                        <form action={setFlagshipAction.bind(null, product.id)}>
                          <button
                            type="submit"
                            className="rounded-xl border border-surface-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink/70 hover:bg-surface-muted hover:text-ink hover:border-ink/20 shadow-2xs transition-all cursor-pointer"
                          >
                            Set Flagship
                          </button>
                        </form>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getProductUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview storefront page"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-surface-line bg-white text-ink/60 shadow-2xs hover:bg-surface-muted hover:text-ink transition-all"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        <Link
                          href={`/admin/products/${product.id}`}
                          title="View product details"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-surface-line bg-white text-ink/60 shadow-2xs hover:bg-surface-muted hover:text-ink transition-all"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>

                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          title="Edit product"
                          className="flex h-8 items-center gap-1 rounded-xl border border-surface-line bg-white px-2.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-muted hover:border-ink/20 transition-all"
                        >
                          <svg className="h-3.5 w-3.5 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </Link>

                        <form action={deleteProductAction.bind(null, product.id)}>
                          <ConfirmSubmitButton
                            confirmMessage="Delete this product permanently? This cannot be undone."
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-ink/40 mb-3">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-bold text-ink">No products found</p>
            <p className="text-xs text-ink/50 mt-1 max-w-sm mx-auto">
              {search || flagshipFilter !== "all"
                ? "No products matched your search or filter criteria."
                : "Your store has no products yet. Add your first product to start selling."}
            </p>
            {search || flagshipFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFlagshipFilter("all");
                  setCurrentPage(1);
                }}
                className="mt-4 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-ink/80 transition-colors"
              >
                Reset Filters
              </button>
            ) : (
              <Link
                href="/admin/products/new"
                className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors"
              >
                + Add First Product
              </Link>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-line bg-surface-muted/30 px-4 py-3.5">
            <div className="text-xs text-ink/60">
              Showing <span className="font-bold text-ink">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-ink">{endIndex}</span> of{" "}
              <span className="font-bold text-ink">{filteredProducts.length}</span> products
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="flex h-8 items-center gap-1 rounded-xl border border-surface-line bg-white px-2.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
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

              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
                className="flex h-8 items-center gap-1 rounded-xl border border-surface-line bg-white px-2.5 text-xs font-semibold text-ink shadow-2xs hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
