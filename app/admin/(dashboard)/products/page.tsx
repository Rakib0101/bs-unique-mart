import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductsTable from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const allProducts = await getAllProducts();

  return (
    <div className="px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink">Products Management</h1>
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-ink/60 border border-surface-line">
              {allProducts.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/60">
            Create, edit, organize inventory, variants, and configure which product is featured as the storefront flagship.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark transition-all self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Table with Pagination & Filters */}
      <ProductsTable products={allProducts} />
    </div>
  );
}
