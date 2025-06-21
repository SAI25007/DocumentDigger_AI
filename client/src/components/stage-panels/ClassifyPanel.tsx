import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Brain, Play, Clock, CheckCircle, AlertCircle, Target } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { DocumentWithStages } from "@shared/schema";

interface ClassifyPanelProps {
  documents: DocumentWithStages[];
  onDocumentSelect: (doc: DocumentWithStages) => void;
  selectedDocument: DocumentWithStages | null;
}

export function ClassifyPanel({ documents, onDocumentSelect, selectedDocument }: ClassifyPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocId, setSelectedDocId] = useState<string>("");

  const runClassifyMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest({
        endpoint: `/api/documents/${documentId}/process/3`,
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Classification Started",
        description: "AI-powered document classification has been initiated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Classification Failed",
        description: error.message || "Failed to start classification process",
        variant: "destructive",
      });
    },
  });

  const handleRunClassify = () => {
    if (selectedDocument) {
      runClassifyMutation.mutate(selectedDocument.id);
    }
  };

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
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Filter documents that have completed extraction
  const classifiableDocuments = documents.filter(doc => {
    const extractStage = doc.stages.find(s => s.stage === 2);
    return extractStage?.status === 'completed';
  });

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

  return (
    <div className="space-y-6">
      {/* Document Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Document Classification
          </CardTitle>
          <CardDescription>
            Use AI to classify documents and determine their type with confidence scoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Document</label>
            <Select 
              value={selectedDocId} 
              onValueChange={(value) => {
                setSelectedDocId(value);
                const doc = classifiableDocuments.find(d => d.id.toString() === value);
                if (doc) onDocumentSelect(doc);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a document to classify" />
              </SelectTrigger>
              <SelectContent>
                {classifiableDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(getStageStatus(doc))}
                      <span>{doc.originalName}</span>
                      {getStatusBadge(getStageStatus(doc))}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleRunClassify}
            disabled={!selectedDocument || runClassifyMutation.isPending || classifiableDocuments.length === 0}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {runClassifyMutation.isPending ? "Classifying..." : "Run Classification"}
          </Button>

          {classifiableDocuments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No documents available for classification. Please complete text extraction first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Classification Results */}
      {selectedDocument && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Classification Results
              </CardTitle>
              <CardDescription>
                AI-powered document type detection and confidence scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Document Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Document</label>
                    <p className="text-sm">{selectedDocument.originalName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(getStageStatus(selectedDocument))}
                      {getStatusBadge(getStageStatus(selectedDocument))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Document Type</label>
                    <div className="flex items-center gap-2">
                      {selectedDocument.documentType ? (
                        <Badge className={`${getDocumentTypeColor(selectedDocument.documentType)} text-white`}>
                          {selectedDocument.documentType}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not classified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Confidence Score</label>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={selectedDocument.confidence || 0} 
                          className="flex-1" 
                        />
                        <span className="text-sm font-medium">{selectedDocument.confidence || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage Details */}
                {(() => {
                  const stage = getClassifyStage(selectedDocument);
                  if (!stage) return null;
                  
                  return (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Processing Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-muted-foreground">Started At</label>
                          <p>{stage.startedAt ? new Date(stage.startedAt).toLocaleString() : "Not started"}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Completed At</label>
                          <p>{stage.completedAt ? new Date(stage.completedAt).toLocaleString() : "Not completed"}</p>
                        </div>
                        {stage.errorMessage && (
                          <div className="col-span-2">
                            <label className="text-muted-foreground">Error Message</label>
                            <p className="text-red-600">{stage.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Document Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Document Types Distribution</CardTitle>
          <CardDescription>Classification results across all documents</CardDescription>
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

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Classification Performance</CardTitle>
          <CardDescription>Overview of document classification statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Available", value: classifiableDocuments.length, color: "bg-blue-500" },
              { label: "Completed", value: classifiableDocuments.filter(d => getStageStatus(d) === 'completed').length, color: "bg-green-500" },
              { label: "Processing", value: classifiableDocuments.filter(d => getStageStatus(d) === 'processing').length, color: "bg-yellow-500" },
              { label: "Failed", value: classifiableDocuments.filter(d => getStageStatus(d) === 'failed').length, color: "bg-red-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 border rounded-lg">
                <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold`}>
                  {stat.value}
                </div>
                <p className="text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}