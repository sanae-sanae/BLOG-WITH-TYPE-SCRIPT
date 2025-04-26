import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
});

// Blog post model
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  authorId: integer("author_id").references(() => users.id),
  published: boolean("published").default(true),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  imageUrl: true,
  category: true,
  tags: true,
  authorId: true,
  published: true,
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  authorId: integer("author_id").references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  authorId: true,
  postId: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
