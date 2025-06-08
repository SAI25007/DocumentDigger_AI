import {
  users,
  documents,
  processingStages,
  type User,
  type UpsertUser,
  type Document,
  type InsertDocument,
  type ProcessingStage,
  type InsertProcessingStage,
  type DocumentWithStages,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentWithStages(id: number): Promise<DocumentWithStages | undefined>;
  getUserDocuments(userId: string): Promise<DocumentWithStages[]>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Processing stage operations
  createProcessingStage(stage: InsertProcessingStage): Promise<ProcessingStage>;
  updateProcessingStage(id: number, updates: Partial<ProcessingStage>): Promise<ProcessingStage>;
  getDocumentStages(documentId: number): Promise<ProcessingStage[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    total: number;
    processed: number;
    processing: number;
    failed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [doc] = await db
      .insert(documents)
      .values(document)
      .returning();
    
    // Create initial processing stages
    const stages = [1, 2, 3, 4].map(stage => ({
      documentId: doc.id,
      stage,
      status: stage === 1 ? "processing" as const : "pending" as const,
      startedAt: stage === 1 ? new Date() : undefined,
    }));
    
    await db.insert(processingStages).values(stages);
    
    return doc;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async getDocumentWithStages(id: number): Promise<DocumentWithStages | undefined> {
    const doc = await this.getDocument(id);
    if (!doc) return undefined;
    
    const stages = await this.getDocumentStages(id);
    return { ...doc, stages };
  }

  async getUserDocuments(userId: string): Promise<DocumentWithStages[]> {
    const userDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
    
    const docsWithStages = await Promise.all(
      userDocs.map(async (doc) => {
        const stages = await this.getDocumentStages(doc.id);
        return { ...doc, stages };
      })
    );
    
    return docsWithStages;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const [doc] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return doc;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(processingStages).where(eq(processingStages.documentId, id));
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Processing stage operations
  async createProcessingStage(stage: InsertProcessingStage): Promise<ProcessingStage> {
    const [newStage] = await db
      .insert(processingStages)
      .values(stage)
      .returning();
    return newStage;
  }

  async updateProcessingStage(id: number, updates: Partial<ProcessingStage>): Promise<ProcessingStage> {
    const [stage] = await db
      .update(processingStages)
      .set(updates)
      .where(eq(processingStages.id, id))
      .returning();
    return stage;
  }

  async getDocumentStages(documentId: number): Promise<ProcessingStage[]> {
    return await db
      .select()
      .from(processingStages)
      .where(eq(processingStages.documentId, documentId))
      .orderBy(processingStages.stage);
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    total: number;
    processed: number;
    processing: number;
    failed: number;
  }> {
    const userDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId));
    
    const total = userDocs.length;
    const processed = userDocs.filter(doc => doc.status === "completed").length;
    const processing = userDocs.filter(doc => doc.status === "processing").length;
    const failed = userDocs.filter(doc => doc.status === "failed").length;
    
    return { total, processed, processing, failed };
  }
}

export const storage = new DatabaseStorage();
