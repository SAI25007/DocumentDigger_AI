import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDocumentSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, and image files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Document routes
  app.post('/api/documents/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      
      const documentData = {
        userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: "processing" as const,
        currentStage: 1,
      };

      const document = await storage.createDocument(documentData);
      
      // Broadcast to WebSocket clients
      broadcastDocumentUpdate(document.id, 'created');
      
      // Start processing pipeline
      processDocument(document.id);
      
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocumentWithStages(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user owns the document
      const userId = req.user.claims.sub;
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post('/api/documents/:id/reprocess', isAuthenticated, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { stage } = req.body;
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user owns the document
      const userId = req.user.claims.sub;
      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Reset document to specified stage
      await storage.updateDocument(documentId, {
        status: "processing",
        currentStage: stage,
      });
      
      // Reset stages from the specified stage onwards
      const stages = await storage.getDocumentStages(documentId);
      for (const stageRecord of stages) {
        if (stageRecord.stage >= stage) {
          await storage.updateProcessingStage(stageRecord.id, {
            status: stageRecord.stage === stage ? "processing" : "pending",
            startedAt: stageRecord.stage === stage ? new Date() : undefined,
            completedAt: undefined,
            errorMessage: undefined,
          });
        }
      }
      
      // Restart processing from the specified stage
      processDocument(documentId, stage);
      
      res.json({ message: "Reprocessing started" });
    } catch (error) {
      console.error("Error reprocessing document:", error);
      res.status(500).json({ message: "Failed to reprocess document" });
    }
  });

  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Helper function to broadcast updates
  function broadcastDocumentUpdate(documentId: number, type: string) {
    const message = JSON.stringify({
      type: 'document_update',
      documentId,
      updateType: type,
      timestamp: new Date().toISOString(),
    });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Document processing simulation
  async function processDocument(documentId: number, startStage: number = 1) {
    const stageNames = ['Ingested', 'Extracted', 'Classified', 'Routed'];
    const stageDurations = [2000, 3000, 2500, 1500]; // milliseconds
    
    for (let stage = startStage; stage <= 4; stage++) {
      try {
        // Update current stage in document
        await storage.updateDocument(documentId, { currentStage: stage });
        
        // Get the stage record
        const stages = await storage.getDocumentStages(documentId);
        const stageRecord = stages.find(s => s.stage === stage);
        
        if (!stageRecord) continue;
        
        // Start processing this stage
        await storage.updateProcessingStage(stageRecord.id, {
          status: "processing",
          startedAt: new Date(),
        });
        
        broadcastDocumentUpdate(documentId, `stage_${stage}_started`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, stageDurations[stage - 1]));
        
        // Simulate potential failure (5% chance)
        if (Math.random() < 0.05) {
          await storage.updateProcessingStage(stageRecord.id, {
            status: "failed",
            completedAt: new Date(),
            errorMessage: `Failed to process stage ${stage}: ${stageNames[stage - 1]}`,
          });
          
          await storage.updateDocument(documentId, { status: "failed" });
          broadcastDocumentUpdate(documentId, `stage_${stage}_failed`);
          return;
        }
        
        // Complete this stage
        let stageDetails: any = {};
        
        if (stage === 2) {
          // Extraction stage - simulate extracted text
          stageDetails.extractedText = "Sample extracted text content...";
          await storage.updateDocument(documentId, {
            extractedText: stageDetails.extractedText,
          });
        } else if (stage === 3) {
          // Classification stage - simulate document type and confidence
          const types = ['Contract', 'Invoice', 'Receipt', 'Legal Document', 'Purchase Order'];
          const documentType = types[Math.floor(Math.random() * types.length)];
          const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%
          
          stageDetails.documentType = documentType;
          stageDetails.confidence = confidence;
          
          await storage.updateDocument(documentId, {
            documentType,
            confidence,
          });
        } else if (stage === 4) {
          // Routing stage - simulate routing to external system
          const systems = ['ERP System', 'Document Management', 'Accounting Software'];
          const routedTo = systems[Math.floor(Math.random() * systems.length)];
          stageDetails.routedTo = routedTo;
        }
        
        await storage.updateProcessingStage(stageRecord.id, {
          status: "completed",
          completedAt: new Date(),
          details: stageDetails,
        });
        
        broadcastDocumentUpdate(documentId, `stage_${stage}_completed`);
      } catch (error) {
        console.error(`Error processing stage ${stage} for document ${documentId}:`, error);
        
        const stages = await storage.getDocumentStages(documentId);
        const stageRecord = stages.find(s => s.stage === stage);
        
        if (stageRecord) {
          await storage.updateProcessingStage(stageRecord.id, {
            status: "failed",
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
        }
        
        await storage.updateDocument(documentId, { status: "failed" });
        broadcastDocumentUpdate(documentId, `stage_${stage}_failed`);
        return;
      }
    }
    
    // Mark document as completed
    await storage.updateDocument(documentId, { status: "completed" });
    broadcastDocumentUpdate(documentId, 'completed');
  }

  return httpServer;
}
