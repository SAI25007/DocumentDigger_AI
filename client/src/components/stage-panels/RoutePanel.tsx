import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Route, Play, Clock, CheckCircle, AlertCircle, Send, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { DocumentWithStages } from "@shared/schema";

interface RoutePanelProps {
  documents: DocumentWithStages[];
  onDocumentSelect: (doc: DocumentWithStages) => void;
  selectedDocument: DocumentWithStages | null;
}

export function RoutePanel({ documents, onDocumentSelect, selectedDocument }: RoutePanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocId, setSelectedDocId] = useState<string>("");

  const runRouteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest({
        endpoint: `/api/documents/${documentId}/process/4`,
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Routing Started",
        description: "Document routing process has been initiated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Routing Failed",
        description: error.message || "Failed to start routing process",
        variant: "destructive",
      });
    },
  });

  const handleRunRoute = () => {
    if (selectedDocument) {
      runRouteMutation.mutate(selectedDocument.id);
    }
  };

  const getRouteStage = (doc: DocumentWithStages) => {
    return doc.stages.find(s => s.stage === 4);
  };

  const getStageStatus = (doc: DocumentWithStages) => {
    const stage = getRouteStage(doc);
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
        return <Route className="h-4 w-4 text-gray-500" />;
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

  // Filter documents that have completed classification
  const routableDocuments = documents.filter(doc => {
    const classifyStage = doc.stages.find(s => s.stage === 3);
    return classifyStage?.status === 'completed';
  });

  const getRouteDestination = (documentType: string | null) => {
    const routes: Record<string, { name: string; color: string; icon: string }> = {
      "Invoice": { name: "Accounts Payable", color: "bg-blue-500", icon: "💰" },
      "Contract": { name: "Legal Department", color: "bg-purple-500", icon: "⚖️" },
      "Receipt": { name: "Expense Management", color: "bg-green-500", icon: "🧾" },
      "Report": { name: "Management Review", color: "bg-orange-500", icon: "📊" },
      "Letter": { name: "Correspondence Archive", color: "bg-pink-500", icon: "📬" },
      "Form": { name: "HR Department", color: "bg-indigo-500", icon: "📋" },
    };
    
    return routes[documentType || ""] || { name: "General Queue", color: "bg-gray-500", icon: "📁" };
  };

  return (
    <div className="space-y-6">
      {/* Document Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Document Routing
          </CardTitle>
          <CardDescription>
            Route classified documents to appropriate target systems and departments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Document</label>
            <Select 
              value={selectedDocId} 
              onValueChange={(value) => {
                setSelectedDocId(value);
                const doc = routableDocuments.find(d => d.id.toString() === value);
                if (doc) onDocumentSelect(doc);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a document to route" />
              </SelectTrigger>
              <SelectContent>
                {routableDocuments.map((doc) => (
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
            onClick={handleRunRoute}
            disabled={!selectedDocument || runRouteMutation.isPending || routableDocuments.length === 0}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {runRouteMutation.isPending ? "Routing..." : "Run Routing"}
          </Button>

          {routableDocuments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No documents available for routing. Please complete classification first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Routing Results */}
      {selectedDocument && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Routing Results
              </CardTitle>
              <CardDescription>
                Document routing destination and delivery status
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
                        <Badge className="bg-blue-500 text-white">
                          {selectedDocument.documentType}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not classified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Route Destination</label>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const route = getRouteDestination(selectedDocument.documentType);
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{route.icon}</span>
                            <Badge className={`${route.color} text-white`}>
                              {route.name}
                            </Badge>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Stage Details */}
                {(() => {
                  const stage = getRouteStage(selectedDocument);
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

      {/* Routing Destinations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Routing Destinations
          </CardTitle>
          <CardDescription>Available routing targets based on document types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: "Invoice", destination: "Accounts Payable", icon: "💰", color: "bg-blue-500" },
              { type: "Contract", destination: "Legal Department", icon: "⚖️", color: "bg-purple-500" },
              { type: "Receipt", destination: "Expense Management", icon: "🧾", color: "bg-green-500" },
              { type: "Report", destination: "Management Review", icon: "📊", color: "bg-orange-500" },
              { type: "Letter", destination: "Correspondence Archive", icon: "📬", color: "bg-pink-500" },
              { type: "Form", destination: "HR Department", icon: "📋", color: "bg-indigo-500" },
            ].map((route) => (
              <div key={route.type} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">{route.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{route.type}</p>
                  <p className="text-sm text-muted-foreground">{route.destination}</p>
                </div>
                <Badge className={`${route.color} text-white`}>
                  {routableDocuments.filter(d => d.documentType === route.type).length} docs
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Performance</CardTitle>
          <CardDescription>Overview of document routing statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Available", value: routableDocuments.length, color: "bg-blue-500" },
              { label: "Completed", value: routableDocuments.filter(d => getStageStatus(d) === 'completed').length, color: "bg-green-500" },
              { label: "Processing", value: routableDocuments.filter(d => getStageStatus(d) === 'processing').length, color: "bg-yellow-500" },
              { label: "Failed", value: routableDocuments.filter(d => getStageStatus(d) === 'failed').length, color: "bg-red-500" },
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