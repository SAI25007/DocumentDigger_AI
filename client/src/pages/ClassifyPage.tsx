import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowLeft, Target, Zap, TrendingUp, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type { DocumentWithStages } from "@shared/schema";

export default function ClassifyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithStages | null>(null);

  // Fetch user documents
  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/documents"],
  });

  // Classify mutation
  const classifyMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest({
        endpoint: `/api/documents/${documentId}/process/3`,
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Classification Started",
        description: "AI document classification process has been initiated",
      });
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: "Classification Failed",
        description: error.message || "Failed to start classification process",
        variant: "destructive",
      });
    },
  });

  // Filter documents that have completed extraction
  const classifiableDocuments = documents.filter((doc: DocumentWithStages) => {
    const extractStage = doc.stages.find(s => s.stage === 2);
    return extractStage?.status === 'completed';
  });

  const getClassifyStage = (doc: DocumentWithStages) => {
    return doc.stages.find(s => s.stage === 3);
  };

  const getStageStatus = (doc: DocumentWithStages) => {
    const stage = getClassifyStage(doc);
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
        return <Brain className="h-4 w-4 text-muted-foreground" />;
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

  const getDocumentTypeColor = (type: string | null) => {
    if (!type) return "bg-gray-500";
    const colors: Record<string, string> = {
      "Invoice": "bg-blue-500",
      "Contract": "bg-purple-500", 
      "Receipt": "bg-green-500",
      "Report": "bg-orange-500",
      "Letter": "bg-pink-500",
      "Form": "bg-indigo-500",
      "Other": "bg-gray-500"
    };
    return colors[type] || "bg-gray-500";
  };

  const handleClassifyDocument = (doc: DocumentWithStages) => {
    setSelectedDocument(doc);
    classifyMutation.mutate(doc.id);
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
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Document Classification</h1>
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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Document Classification
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatically classify documents using advanced machine learning models. Our AI analyzes content, structure, and context to determine document types with high confidence scores.
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
                AI Classification Features
              </CardTitle>
              <CardDescription>
                State-of-the-art machine learning for document type identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Multi-Model AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Combines multiple AI models for accurate document classification
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Confidence Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Provides confidence percentages for classification accuracy
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold mb-2">Real-time Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Fast classification with immediate results and feedback
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Custom Categories</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports custom document types and industry-specific categories
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
              <CardTitle>Available Documents for Classification</CardTitle>
              <CardDescription>
                Documents that have completed text extraction and are ready for AI classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classifiableDocuments.map((doc: DocumentWithStages) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(getStageStatus(doc))}
                      <div className="flex-1">
                        <p className="font-medium">{doc.originalName}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                          {doc.documentType && (
                            <Badge className={`${getDocumentTypeColor(doc.documentType)} text-white`}>
                              {doc.documentType}
                            </Badge>
                          )}
                          {doc.confidence && (
                            <span className="flex items-center gap-1">
                              Confidence: {doc.confidence}%
                              <Progress value={doc.confidence} className="w-16" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(getStageStatus(doc))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleClassifyDocument(doc)}
                        disabled={classifyMutation.isPending}
                      >
                        Classify
                      </Button>
                    </div>
                  </div>
                ))}
                
                {classifiableDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents ready for classification. Complete text extraction first.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Types Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Document Types Distribution</CardTitle>
              <CardDescription>Classification results across all processed documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const typeStats = classifiableDocuments.reduce((acc, doc) => {
                    const type = doc.documentType || "Unclassified";
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  return Object.entries(typeStats).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${getDocumentTypeColor(type)}`} />
                        <span className="font-medium">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{count} docs</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((count / classifiableDocuments.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}