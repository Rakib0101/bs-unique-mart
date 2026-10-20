import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      // \p{M} keeps combining marks — essential for Bengali and other Indic
      // scripts, where vowel signs and the virama are separate combining
      // characters, not letters. Without it, e.g. "স্টাইলিশ" loses every
      // vowel sign and conjunct marker, producing unreadable fragments.
      .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || `product-${Date.now()}`
  );
}

/** Slugifies `title` and appends -2, -3, ... until it doesn't collide with another product. */
export async function uniqueProductSlug(title: string, excludeId?: number) {
  const base = slugify(title);
  const db = getDb();

  let slug = base;
  for (let suffix = 2; ; suffix++) {
    const clash = await db
      .select({ id: products.id })
      .from(products)
      .where(
        excludeId
          ? and(eq(products.slug, slug), ne(products.id, excludeId))
          : eq(products.slug, slug),
      )
      .limit(1);
    if (clash.length === 0) return slug;
    slug = `${base}-${suffix}`;
  }
}
