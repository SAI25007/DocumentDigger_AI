import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileSearch, ArrowLeft, Brain, Zap, Eye, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type { DocumentWithStages } from "@shared/schema";

export default function ExtractPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithStages | null>(null);

  // Fetch user documents
  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/documents"],
  });

  // Extract mutation
  const extractMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest({
        endpoint: `/api/documents/${documentId}/process/2`,
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Extraction Started",
        description: "AI text extraction process has been initiated",
      });
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to start extraction process",
        variant: "destructive",
      });
    },
  });

  // Filter documents that have completed ingestion
  const extractableDocuments = documents.filter((doc: DocumentWithStages) => {
    const ingestStage = doc.stages.find(s => s.stage === 1);
    return ingestStage?.status === 'completed';
  });

  const getExtractStage = (doc: DocumentWithStages) => {
    return doc.stages.find(s => s.stage === 2);
  };

  const getStageStatus = (doc: DocumentWithStages) => {
    const stage = getExtractStage(doc);
    return stage?.status || 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileSearch className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleExtractDocument = (doc: DocumentWithStages) => {
    setSelectedDocument(doc);
    extractMutation.mutate(doc.id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <FileSearch className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Text Extraction</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <FileSearch className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AI Text Extraction Engine
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Extract text, tables, and structured data from documents using advanced OCR and AI parsing. Our extraction engine handles complex layouts and multiple formats with high accuracy.
          </p>
        </motion.div>

        {/* AI Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Extraction Capabilities
              </CardTitle>
              <CardDescription>
                Advanced AI-powered text and data extraction features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">OCR Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced optical character recognition for scanned documents
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold mb-2">Table Extraction</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent table detection and structured data extraction
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Layout Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Preserves document structure and formatting context
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Brain className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Entity Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Identifies names, dates, amounts, and key entities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Available Documents for Extraction</CardTitle>
              <CardDescription>
                Documents that have completed ingestion and are ready for text extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {extractableDocuments.map((doc: DocumentWithStages) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(getStageStatus(doc))}
                      <div>
                        <p className="font-medium">{doc.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {(doc.fileSize / 1024).toFixed(2)} KB • {doc.mimeType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(getStageStatus(doc))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExtractDocument(doc)}
                        disabled={extractMutation.isPending}
                      >
                        Extract
                      </Button>
                    </div>
                  </div>
                ))}
                
                {extractableDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents ready for extraction. Complete document ingestion first.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Extracted Text Preview */}
        {selectedDocument && selectedDocument.extractedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Extracted Text Preview
                </CardTitle>
                <CardDescription>
                  Text content extracted from {selectedDocument.originalName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={selectedDocument.extractedText}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="No text extracted yet..."
                />
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{selectedDocument.extractedText.length} characters extracted</span>
                  <span>{selectedDocument.extractedText.split(/\s+/).length} words</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}