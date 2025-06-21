import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, ArrowLeft, Send, MapPin, Zap, Target, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type { DocumentWithStages } from "@shared/schema";

export default function RoutePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithStages | null>(null);

  // Fetch user documents
  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/documents"],
  });

  // Route mutation
  const routeMutation = useMutation({
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
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: "Routing Failed",
        description: error.message || "Failed to start routing process",
        variant: "destructive",
      });
    },
  });

  // Filter documents that have completed classification
  const routableDocuments = documents.filter((doc: DocumentWithStages) => {
    const classifyStage = doc.stages.find(s => s.stage === 3);
    return classifyStage?.status === 'completed';
  });

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
        return <Route className="h-4 w-4 text-muted-foreground" />;
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

  const handleRouteDocument = (doc: DocumentWithStages) => {
    setSelectedDocument(doc);
    routeMutation.mutate(doc.id);
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
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Route className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Document Routing</h1>
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
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Route className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Intelligent Document Routing
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatically route documents to appropriate systems and departments based on their classification. Our AI determines the optimal destination for each document type with smart workflow integration.
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
                <Send className="h-5 w-5" />
                AI Routing Capabilities
              </CardTitle>
              <CardDescription>
                Intelligent routing and workflow automation features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                  <h3 className="font-semibold mb-2">Smart Routing</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered routing based on document type and content analysis
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold mb-2">Workflow Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamless integration with existing business workflows and systems
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MapPin className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Multi-Destination</h3>
                  <p className="text-sm text-muted-foreground">
                    Route to multiple systems simultaneously with priority handling
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Send className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Real-time Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant delivery with tracking and confirmation notifications
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
              <CardTitle>Available Documents for Routing</CardTitle>
              <CardDescription>
                Classified documents ready for intelligent routing to target systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routableDocuments.map((doc: DocumentWithStages) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(getStageStatus(doc))}
                      <div className="flex-1">
                        <p className="font-medium">{doc.originalName}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                          {doc.documentType && (
                            <div className="flex items-center gap-2">
                              <span>Type: {doc.documentType}</span>
                              <span className="text-lg">{getRouteDestination(doc.documentType).icon}</span>
                              <Badge className={`${getRouteDestination(doc.documentType).color} text-white`}>
                                {getRouteDestination(doc.documentType).name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(getStageStatus(doc))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRouteDocument(doc)}
                        disabled={routeMutation.isPending}
                      >
                        Route
                      </Button>
                    </div>
                  </div>
                ))}
                
                {routableDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents ready for routing. Complete document classification first.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Routing Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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
                  { type: "Invoice", destination: "Accounts Payable", icon: "💰", color: "bg-blue-500", description: "Financial processing and payment approval" },
                  { type: "Contract", destination: "Legal Department", icon: "⚖️", color: "bg-purple-500", description: "Legal review and compliance verification" },
                  { type: "Receipt", destination: "Expense Management", icon: "🧾", color: "bg-green-500", description: "Expense tracking and reimbursement" },
                  { type: "Report", destination: "Management Review", icon: "📊", color: "bg-orange-500", description: "Executive analysis and decision making" },
                  { type: "Letter", destination: "Correspondence Archive", icon: "📬", color: "bg-pink-500", description: "Document archival and record keeping" },
                  { type: "Form", destination: "HR Department", icon: "📋", color: "bg-indigo-500", description: "Human resources processing" },
                ].map((route) => (
                  <div key={route.type} className="flex items-start gap-3 p-4 border rounded-lg">
                    <span className="text-3xl">{route.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{route.type}</h3>
                        <Badge className={`${route.color} text-white`}>
                          {route.destination}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{route.description}</p>
                      <div className="mt-2">
                        <Badge variant="outline">
                          {routableDocuments.filter(d => d.documentType === route.type).length} documents
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}