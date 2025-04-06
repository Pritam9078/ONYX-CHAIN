import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").notNull().unique(),
  displayName: text("display_name"),
  profileImage: text("profile_image"), // Base64 encoded or URL to image
  preferences: text("preferences").default('{"darkMode":true,"animations":true,"notifications":true}'), // JSON string of user preferences
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileData: text("file_data").notNull(), // Base64 encoded or URL to file
  walletAddress: text("wallet_address").notNull(),
  uploadTimestamp: timestamp("upload_timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  displayName: true,
  profileImage: true,
  preferences: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  fileName: true,
  fileType: true,
  fileSize: true,
  fileData: true,
  walletAddress: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
