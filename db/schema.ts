import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 1000 }),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// imageUrl uses longtext to support large base64 images
export const albums = mysqlTable("albums", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(), // Base64 images stored as TEXT (upgraded to MEDIUMTEXT via raw SQL)
  isVideo: bigint("isVideo", { mode: "number", unsigned: true }).default(0),
  date: varchar("date", { length: 50 }),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Album = typeof albums.$inferSelect;
export type InsertAlbum = typeof albums.$inferInsert;

export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(), // Base64/messages stored as TEXT (upgraded to MEDIUMTEXT via raw SQL)
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const milestones = mysqlTable("milestones", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: varchar("date", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("star").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

export const coverSettings = mysqlTable("cover_settings", {
  id: serial("id").primaryKey(),
  imageUrl: text("imageUrl").notNull(), // Base64 images stored as TEXT (upgraded to MEDIUMTEXT via raw SQL)
  title: varchar("title", { length: 255 }).default("拾光信笺").notNull(),
  subtitle: varchar("subtitle", { length: 255 }).default("记录成长的每一刻").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CoverSettings = typeof coverSettings.$inferSelect;
export type InsertCoverSettings = typeof coverSettings.$inferInsert;
