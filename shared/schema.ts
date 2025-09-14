import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("buyer"), // buyer, seller, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sellers = pgTable("sellers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  shopName: text("shop_name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  location: json("location").$type<{ lat: number; lng: number }>(),
  verified: boolean("verified").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: decimal("review_count").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parts = pgTable("parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehicleYear: text("vehicle_year"),
  availability: text("availability").notNull().default("in_stock"), // in_stock, low_stock, out_of_stock
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehicleYear: text("vehicle_year"),
  partName: text("part_name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => sellers.id).notNull(),
  type: text("type").notNull(), // whatsapp, call, profile_view
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertSellerSchema = createInsertSchema(sellers).omit({
  id: true,
  verified: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
});

export const insertPartSchema = createInsertSchema(parts).omit({
  id: true,
  createdAt: true,
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Seller = typeof sellers.$inferSelect;
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;
export type Search = typeof searches.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Extended types for API responses
export type SellerWithParts = Seller & {
  parts: Part[];
  user: Pick<User, 'username' | 'email'>;
};

export type SearchResult = {
  seller: SellerWithParts;
  matchingParts: Part[];
};
