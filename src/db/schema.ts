import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const paymentMethodEnum = pgEnum("payment_method", ["pix", "card"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "provisioning",
  "delivered",
  "failed",
  "refunded",
]);

export const plans = pgTable("plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerPlanId: text("provider_plan_id").notNull(),
  provider: text("provider").notNull().default("mock"),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  countryCodes: text("country_codes").array().notNull(),
  region: text("region").notNull(),
  dataAmountMb: integer("data_amount_mb").notNull(),
  validityDays: integer("validity_days").notNull(),
  wholesalePriceUsd: numeric("wholesale_price_usd", { precision: 10, scale: 2 }).notNull(),
  retailPriceBrl: numeric("retail_price_brl", { precision: 10, scale: 2 }).notNull(),
  marginPercent: numeric("margin_percent", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  publicId: text("public_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerCpf: text("customer_cpf").notNull(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  asaasPaymentId: text("asaas_payment_id"),
  asaasCustomerId: text("asaas_customer_id"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  amountBrl: numeric("amount_brl", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  providerOrderId: text("provider_order_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
  deliveredAt: timestamp("delivered_at"),
});

export const esims = pgTable("esims", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id)
    .unique(),
  iccid: text("iccid").notNull(),
  qrCodeUrl: text("qr_code_url").notNull(),
  smdpAddress: text("smdp_address").notNull(),
  activationCode: text("activation_code").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DestinationFaq = { question: string; answer: string };
export type DestinationTip = { title: string; content: string };

export const destinations = pgTable("destinations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull(),
  region: text("region").notNull(),
  flagEmoji: text("flag_emoji").notNull(),
  heroText: text("hero_text").notNull(),
  intro: text("intro").notNull().default(""),
  tipsJson: jsonb("tips_json").$type<DestinationTip[]>().notNull().default([]),
  faqJson: jsonb("faq_json").$type<DestinationFaq[]>().notNull().default([]),
  relatedPostSlugs: text("related_post_slugs").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
});

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const plansRelations = relations(plans, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  plan: one(plans, { fields: [orders.planId], references: [plans.id] }),
  esim: one(esims, { fields: [orders.id], references: [esims.orderId] }),
}));

export const esimsRelations = relations(esims, ({ one }) => ({
  order: one(orders, { fields: [esims.orderId], references: [orders.id] }),
}));

export type Plan = typeof plans.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Esim = typeof esims.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
