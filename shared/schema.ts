import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  documentType: text("document_type"), // Contract, Invoice, Receipt, etc.
  confidence: integer("confidence"), // 0-100
  extractedText: text("extracted_text"),
  metadata: jsonb("metadata"),
  currentStage: integer("current_stage").notNull().default(1), // 1-4
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Processing stages table
export const processingStages = pgTable("processing_stages", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  stage: integer("stage").notNull(), // 1=Ingested, 2=Extracted, 3=Classified, 4=Routed
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document relations
export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  stages: many(processingStages),
}));

export const processingStagesRelations = relations(processingStages, ({ one }) => ({
  document: one(documents, {
    fields: [processingStages.documentId],
    references: [documents.id],
  }),
}));

// Insert schemas
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProcessingStageSchema = createInsertSchema(processingStages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ProcessingStage = typeof processingStages.$inferSelect;
export type InsertProcessingStage = z.infer<typeof insertProcessingStageSchema>;

// Document with stages
export type DocumentWithStages = Document & {
  stages: ProcessingStage[];
};
