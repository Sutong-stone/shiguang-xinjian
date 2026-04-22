import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const albums = mysqlTable("albums", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  date: varchar("date", { length: 50 }),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Album = typeof albums.$inferSelect;
export type InsertAlbum = typeof albums.$inferInsert;

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
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
