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

// Memory storage implementation as fallback
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private documents: Map<number, Document> = new Map();
  private stages: Map<number, ProcessingStage> = new Map();
  private nextDocId = 1;
  private nextStageId = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: this.users.get(userData.id)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const doc: Document = {
      ...document,
      id: this.nextDocId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(doc.id, doc);
    
    // Create initial processing stages
    const stages = [1, 2, 3, 4].map(stage => ({
      documentId: doc.id,
      stage,
      status: stage === 1 ? "processing" as const : "pending" as const,
      startedAt: stage === 1 ? new Date() : undefined,
    }));
    
    for (const stageData of stages) {
      await this.createProcessingStage(stageData);
    }
    
    return doc;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentWithStages(id: number): Promise<DocumentWithStages | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    const stages = Array.from(this.stages.values())
      .filter(s => s.documentId === id)
      .sort((a, b) => a.stage - b.stage);
    
    return { ...doc, stages };
  }

  async getUserDocuments(userId: string): Promise<DocumentWithStages[]> {
    const userDocs = Array.from(this.documents.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    const result: DocumentWithStages[] = [];
    for (const doc of userDocs) {
      const stages = Array.from(this.stages.values())
        .filter(s => s.documentId === doc.id)
        .sort((a, b) => a.stage - b.stage);
      result.push({ ...doc, stages });
    }
    
    return result;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const existing = this.documents.get(id);
    if (!existing) throw new Error("Document not found");
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: number): Promise<void> {
    this.documents.delete(id);
    // Remove associated stages
    for (const [stageId, stage] of this.stages.entries()) {
      if (stage.documentId === id) {
        this.stages.delete(stageId);
      }
    }
  }

  async createProcessingStage(stage: InsertProcessingStage): Promise<ProcessingStage> {
    const newStage: ProcessingStage = {
      ...stage,
      id: this.nextStageId++,
      createdAt: new Date(),
    };
    this.stages.set(newStage.id, newStage);
    return newStage;
  }

  async updateProcessingStage(id: number, updates: Partial<ProcessingStage>): Promise<ProcessingStage> {
    const existing = this.stages.get(id);
    if (!existing) throw new Error("Processing stage not found");
    
    const updated = { ...existing, ...updates };
    this.stages.set(id, updated);
    return updated;
  }

  async getDocumentStages(documentId: number): Promise<ProcessingStage[]> {
    return Array.from(this.stages.values())
      .filter(s => s.documentId === documentId)
      .sort((a, b) => a.stage - b.stage);
  }

  async getUserStats(userId: string): Promise<{
    total: number;
    processed: number;
    processing: number;
    failed: number;
  }> {
    const userDocs = Array.from(this.documents.values()).filter(d => d.userId === userId);
    
    return {
      total: userDocs.length,
      processed: userDocs.filter(d => d.status === "completed").length,
      processing: userDocs.filter(d => d.status === "processing").length,
      failed: userDocs.filter(d => d.status === "failed").length,
    };
  }
}

// Initialize storage with fallback
async function initializeStorage(): Promise<IStorage> {
  try {
    // Test database connection
    await db.select().from(users).limit(1);
    console.log("Using database storage");
    return new DatabaseStorage();
  } catch (error) {
    console.warn("Database connection failed, using memory storage:", error.message);
    return new MemoryStorage();
  }
}

// Export a promise that resolves to the storage instance
export const storagePromise = initializeStorage();

// For backward compatibility, export a storage getter
let _storage: IStorage | null = null;
export const storage = {
  async getUser(id: string) {
    if (!_storage) _storage = await storagePromise;
    return _storage.getUser(id);
  },
  async upsertUser(user: UpsertUser) {
    if (!_storage) _storage = await storagePromise;
    return _storage.upsertUser(user);
  },
  async createDocument(document: InsertDocument) {
    if (!_storage) _storage = await storagePromise;
    return _storage.createDocument(document);
  },
  async getDocument(id: number) {
    if (!_storage) _storage = await storagePromise;
    return _storage.getDocument(id);
  },
  async getDocumentWithStages(id: number) {
    if (!_storage) _storage = await storagePromise;
    return _storage.getDocumentWithStages(id);
  },
  async getUserDocuments(userId: string) {
    if (!_storage) _storage = await storagePromise;
    return _storage.getUserDocuments(userId);
  },
  async updateDocument(id: number, updates: Partial<Document>) {
    if (!_storage) _storage = await storagePromise;
    return _storage.updateDocument(id, updates);
  },
  async deleteDocument(id: number) {
    if (!_storage) _storage = await storagePromise;
    return _storage.deleteDocument(id);
  },
  async createProcessingStage(stage: InsertProcessingStage) {
    if (!_storage) _storage = await storagePromise;
    return _storage.createProcessingStage(stage);
  },
  async updateProcessingStage(id: number, updates: Partial<ProcessingStage>) {
    if (!_storage) _storage = await storagePromise;
    return _storage.updateProcessingStage(id, updates);
  },
  async getDocumentStages(documentId: number) {
    if (!_storage) _storage = await storagePromise;
    return _storage.getDocumentStages(documentId);
  },
  async getUserStats(userId: string) {
    if (!_storage) _storage = await storagePromise;
    return _storage.getUserStats(userId);
  }
};
