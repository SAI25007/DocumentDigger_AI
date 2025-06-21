import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft, Brain, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UploadZone } from "@/components/ui/upload-zone";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type { DocumentWithStages } from "@shared/schema";

export default function IngestPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithStages | null>(null);

  // Fetch user documents
  const { data: documents = [], isLoading: documentsLoading, refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/documents"],
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const promises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiRequest({
          endpoint: '/api/upload',
          method: 'POST',
          body: formData,
        });
        
        return { file, data: response };
      });
      
      return Promise.all(promises);
    },
    onSuccess: (results) => {
      toast({
        title: "Upload Successful",
        description: `${results.length} file(s) uploaded and ingestion started`,
      });
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  // Manual ingest mutation
  const ingestMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest({
        endpoint: `/api/documents/${documentId}/process/1`,
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Ingestion Started",
        description: "Document ingestion process has been initiated",
      });
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: "Ingestion Failed",
        description: error.message || "Failed to start ingestion process",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (files: FileList) => {
    if (files.length === 0) return;
    uploadMutation.mutate(files);
  };

  const handleIngestDocument = (doc: DocumentWithStages) => {
    setSelectedDocument(doc);
    ingestMutation.mutate(doc.id);
  };

  const getIngestStage = (doc: DocumentWithStages) => {
    return doc.stages.find(s => s.stage === 1);
  };

  const getStageStatus = (doc: DocumentWithStages) => {
    const stage = getIngestStage(doc);
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
        return <FileText className="h-4 w-4 text-muted-foreground" />;
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Document Ingestion</h1>
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Document Ingestion
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload and ingest documents with intelligent metadata extraction and validation. Our AI analyzes file structure, content type, and quality to prepare documents for processing.
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Documents
              </CardTitle>
              <CardDescription>
                Drag and drop files or click to browse. Supports PDF, DOCX, and image files up to 50MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadZone 
                onFileUpload={handleFileUpload}
                isUploading={uploadMutation.isPending}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Ingestion Features
              </CardTitle>
              <CardDescription>
                Advanced AI capabilities for intelligent document ingestion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Smart Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically validates file integrity, format compatibility, and content quality
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold mb-2">Metadata Extraction</h3>
                  <p className="text-sm text-muted-foreground">
                    Extracts comprehensive metadata including creation date, author, and document properties
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Quality Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzes document quality and suggests optimization for better processing results
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Manage and monitor your ingested documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc: DocumentWithStages) => (
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
                        onClick={() => handleIngestDocument(doc)}
                        disabled={ingestMutation.isPending}
                      >
                        Re-ingest
                      </Button>
                    </div>
                  </div>
                ))}
                
                {documents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet. Upload your first document to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}