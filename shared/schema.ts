import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  plantedDate: timestamp("planted_date").notNull(),
  expectedHarvestDate: timestamp("expected_harvest_date").notNull(),
  status: text("status").notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  priority: text("priority").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  userId: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  userId: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Crop = typeof crops.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Task = typeof tasks.$inferSelect;
