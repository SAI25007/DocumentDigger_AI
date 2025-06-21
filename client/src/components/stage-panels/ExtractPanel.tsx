import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileSearch, Play, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { DocumentWithStages } from "@shared/schema";

interface ExtractPanelProps {
  documents: DocumentWithStages[];
  onDocumentSelect: (doc: DocumentWithStages) => void;
  selectedDocument: DocumentWithStages | null;
}

export function ExtractPanel({ documents, onDocumentSelect, selectedDocument }: ExtractPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocId, setSelectedDocId] = useState<string>("");

  const runExtractMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest({
        endpoint: `/api/documents/${documentId}/process/2`,
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Extraction Started",
        description: "Text extraction process has been initiated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to start extraction process",
        variant: "destructive",
      });
    },
  });

  const handleRunExtract = () => {
    if (selectedDocument) {
      runExtractMutation.mutate(selectedDocument.id);
    }
  };

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
        return <FileSearch className="h-4 w-4 text-gray-500" />;
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

  // Filter documents that have completed ingestion
  const extractableDocuments = documents.filter(doc => {
    const ingestStage = doc.stages.find(s => s.stage === 1);
    return ingestStage?.status === 'completed';
  });

  return (
    <div className="space-y-6">
      {/* Document Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Text Extraction
          </CardTitle>
          <CardDescription>
            Extract text and data from ingested documents using OCR and parsing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Document</label>
            <Select 
              value={selectedDocId} 
              onValueChange={(value) => {
                setSelectedDocId(value);
                const doc = extractableDocuments.find(d => d.id.toString() === value);
                if (doc) onDocumentSelect(doc);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a document to extract" />
              </SelectTrigger>
              <SelectContent>
                {extractableDocuments.map((doc) => (
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
            onClick={handleRunExtract}
            disabled={!selectedDocument || runExtractMutation.isPending || extractableDocuments.length === 0}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {runExtractMutation.isPending ? "Extracting..." : "Run Extraction"}
          </Button>

          {extractableDocuments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No documents available for extraction. Please complete ingestion first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Extracted Text Preview */}
      {selectedDocument && selectedDocument.extractedText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Extracted Text
              </CardTitle>
              <CardDescription>
                Text content extracted from the document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={selectedDocument.extractedText}
                readOnly
                className="min-h-[200px] font-mono text-sm"
                placeholder="No text extracted yet..."
              />
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedDocument.extractedText.length} characters extracted
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stage Results */}
      {selectedDocument && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Extraction Results</CardTitle>
              <CardDescription>
                Details about the text extraction process
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
                    <label className="text-sm font-medium text-muted-foreground">Text Length</label>
                    <p className="text-sm">{selectedDocument.extractedText?.length || 0} characters</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Word Count</label>
                    <p className="text-sm">
                      {selectedDocument.extractedText ? selectedDocument.extractedText.split(/\s+/).length : 0} words
                    </p>
                  </div>
                </div>

                {/* Stage Details */}
                {(() => {
                  const stage = getExtractStage(selectedDocument);
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

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Extraction Performance</CardTitle>
          <CardDescription>Overview of text extraction statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Available", value: extractableDocuments.length, color: "bg-blue-500" },
              { label: "Completed", value: extractableDocuments.filter(d => getStageStatus(d) === 'completed').length, color: "bg-green-500" },
              { label: "Processing", value: extractableDocuments.filter(d => getStageStatus(d) === 'processing').length, color: "bg-yellow-500" },
              { label: "Failed", value: extractableDocuments.filter(d => getStageStatus(d) === 'failed').length, color: "bg-red-500" },
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