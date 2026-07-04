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

export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const couponTypeEnum = pgEnum("coupon_type", ["percent", "fixed"]);
export const couponOriginEnum = pgEnum("coupon_origin", ["referral", "manual"]);

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
  currentMarginPercent: numeric("current_margin_percent", { precision: 5, scale: 2 }),
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
  discountBrl: numeric("discount_brl", { precision: 10, scale: 2 }).notNull().default("0"),
  couponId: text("coupon_id"),
  status: orderStatusEnum("status").notNull().default("pending"),
  providerOrderId: text("provider_order_id"),
  travelDate: timestamp("travel_date"),
  reviewRequestSentAt: timestamp("review_request_sent_at"),
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

export const analyticsEvents = pgTable("analytics_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  event: text("event").notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  rate: numeric("rate", { precision: 10, scale: 4 }).notNull(),
  source: text("source").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const priceChanges = pgTable("price_changes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  oldPrice: numeric("old_price", { precision: 10, scale: 2 }).notNull(),
  newPrice: numeric("new_price", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const priceChangesRelations = relations(priceChanges, ({ one }) => ({
  plan: one(plans, { fields: [priceChanges.planId], references: [plans.id] }),
}));

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id),
  rating: integer("rating"),
  comment: text("comment"),
  customerFirstName: text("customer_first_name").notNull(),
  destinationSlug: text("destination_slug").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  moderatedAt: timestamp("moderated_at"),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
}));

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  type: couponTypeEnum("type").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  minOrderBrl: numeric("min_order_brl", { precision: 10, scale: 2 }).notNull().default("0"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  origin: couponOriginEnum("origin").notNull().default("manual"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrerOrderId: text("referrer_order_id")
    .notNull()
    .unique()
    .references(() => orders.id),
  referrerEmail: text("referrer_email").notNull(),
  refCode: text("ref_code").notNull().unique(),
  friendOrderId: text("friend_order_id").references(() => orders.id),
  rewardCouponId: text("reward_coupon_id").references(() => coupons.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  convertedAt: timestamp("converted_at"),
});

export const couponsRelations = relations(coupons, ({ many }) => ({
  orders: many(orders),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrerOrder: one(orders, {
    fields: [referrals.referrerOrderId],
    references: [orders.id],
    relationName: "referrerOrder",
  }),
  friendOrder: one(orders, {
    fields: [referrals.friendOrderId],
    references: [orders.id],
    relationName: "friendOrder",
  }),
  rewardCoupon: one(coupons, {
    fields: [referrals.rewardCouponId],
    references: [coupons.id],
  }),
}));

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
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type PriceChange = typeof priceChanges.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
