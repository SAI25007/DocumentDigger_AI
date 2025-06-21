import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';

const router = Router();

// Process a specific stage for a document
router.post('/documents/:id/process/:stage', isAuthenticated, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const stage = parseInt(req.params.stage);
    const userId = (req.user as { id: number }).id;

    // Validate stage number
    if (stage < 1 || stage > 4) {
      return res.status(400).json({ error: 'Invalid stage number. Must be between 1 and 4.' });
    }

    // Get the document
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (String(document.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get the stage
    const stages = await storage.getDocumentStages(documentId);
    const stageToProcess = stages.find(s => s.stage === stage);
    
    if (!stageToProcess) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    // Check if previous stage is completed (except for stage 1)
    if (stage > 1) {
      const previousStage = stages.find(s => s.stage === stage - 1);
      if (!previousStage || previousStage.status !== 'completed') {
        return res.status(400).json({ 
          error: `Cannot process stage ${stage}. Previous stage must be completed first.` 
        });
      }
    }

    // Update stage to processing
    await storage.updateProcessingStage(stageToProcess.id, {
      status: 'processing',
      startedAt: new Date(),
      errorMessage: null
    });

    // Simulate processing with different logic for each stage
    setTimeout(async () => {
      try {
        let updateData: any = {
          status: 'completed',
          completedAt: new Date()
        };

        switch (stage) {
          case 1: // Ingest
            // Update document metadata
            await storage.updateDocument(documentId, {
              status: 'processing',
              currentStage: Math.max(document.currentStage, 1)
            });
            break;

          case 2: // Extract
            // Simulate text extraction
            const extractedText = `Extracted text from ${document.originalName}\n\nThis is simulated extracted text content. In a real implementation, this would be extracted using OCR or PDF parsing libraries.\n\nDocument contains various information that has been processed and extracted for further analysis.`;
            
            await storage.updateDocument(documentId, {
              extractedText,
              currentStage: Math.max(document.currentStage, 2)
            });
            break;

          case 3: // Classify
            // Simulate AI classification
            const documentTypes = ['Invoice', 'Contract', 'Receipt', 'Report', 'Letter', 'Form'];
            const randomType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
            const confidence = Math.floor(Math.random() * 30) + 70; // 70-100% confidence
            
            await storage.updateDocument(documentId, {
              documentType: randomType,
              confidence,
              currentStage: Math.max(document.currentStage, 3)
            });
            
            updateData.details = {
              documentType: randomType,
              confidence
            };
            break;

          case 4: // Route
            // Simulate routing decision
            const routingDestinations = {
              'Invoice': 'Accounts Payable',
              'Contract': 'Legal Department', 
              'Receipt': 'Expense Management',
              'Report': 'Management Review',
              'Letter': 'Correspondence Archive',
              'Form': 'HR Department'
            };
            
            const destination = routingDestinations[document.documentType as keyof typeof routingDestinations] || 'General Queue';
            
            await storage.updateDocument(documentId, {
              status: 'completed',
              currentStage: Math.max(document.currentStage, 4)
            });
            
            updateData.details = {
              destination,
              routedAt: new Date()
            };
            break;
        }

        await storage.updateProcessingStage(stageToProcess.id, updateData);
        
      } catch (error) {
        console.error(`Error processing stage ${stage} for document ${documentId}:`, error);
        await storage.updateProcessingStage(stageToProcess.id, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }, Math.random() * 3000 + 1000); // Random delay between 1-4 seconds

    res.json({ 
      message: `Stage ${stage} processing started`,
      stage: stageToProcess
    });

  } catch (error) {
    console.error('Error processing stage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;