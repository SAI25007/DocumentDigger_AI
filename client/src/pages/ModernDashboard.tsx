import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Upload, Zap, FileText, Users, TrendingUp, LogOut, Settings, Bell, Menu, Home, BarChart3, Monitor, FileSearch, Route } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { WorkflowProgress } from "@/components/ui/workflow-progress";
import { DocumentGrid } from "@/components/ui/document-grid";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngestPanel } from "@/components/stage-panels/IngestPanel";
import { ExtractPanel } from "@/components/stage-panels/ExtractPanel";
import { ClassifyPanel } from "@/components/stage-panels/ClassifyPanel";
import { RoutePanel } from "@/components/stage-panels/RoutePanel";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import type { DocumentWithStages } from "@shared/schema";

export default function ModernDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithStages | null>(null);

  // Fetch user documents
  const { data: documents = [], isLoading: documentsLoading, refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (message) => {
      if (message.type === "document_update") {
        refetchDocuments();
        toast({
          title: "Document Updated",
          description: `Document processing ${message.updateType}`,
        });
      }
    },
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      return apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      refetchDocuments();
      toast({
        title: "Upload Successful",
        description: "Your documents have been uploaded and processing has started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reprocess mutation
  const reprocessMutation = useMutation({
    mutationFn: async ({ documentId, stage }: { documentId: number; stage?: number }) => {
      return apiRequest(`/api/documents/${documentId}/reprocess`, {
        method: "POST",
        body: JSON.stringify({ stage }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      refetchDocuments();
      toast({
        title: "Reprocessing Started",
        description: "The document is being reprocessed.",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  const handleFileUpload = (files: FileList) => {
    uploadMutation.mutate(files);
  };

  const handleDocumentClick = (doc: DocumentWithStages) => {
    setSelectedDocument(doc);
  };

  const handleRetry = (docId: number) => {
    reprocessMutation.mutate({ documentId: docId });
  };

  const handleReprocess = (docId: number) => {
    reprocessMutation.mutate({ documentId: docId, stage: 1 });
  };

  const getWorkflowStages = (doc?: DocumentWithStages) => {
    const defaultStages = [
      { stage: 1, name: "Ingested", status: "pending" as const },
      { stage: 2, name: "Extracted", status: "pending" as const },
      { stage: 3, name: "Classified", status: "pending" as const },
      { stage: 4, name: "Routed", status: "pending" as const },
    ];

    if (!doc) return defaultStages;

    return defaultStages.map(stage => {
      const docStage = doc.stages.find(s => s.stage === stage.stage);
      return {
        ...stage,
        status: docStage?.status || "pending",
        timestamp: docStage?.completedAt ? new Date(docStage.completedAt).toLocaleTimeString() : undefined,
        duration: docStage?.status === "completed" ? "2.3s" : undefined,
        confidence: stage.stage === 3 && docStage?.status === "completed" ? 94 : undefined,
      };
    });
  };

  if (authLoading) {
    return (
      <AnimatedBackground variant="minimal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="neural">
      <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DocFlow AI
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/upload">
                <Button variant="default" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </Link>
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                <span className="text-sm font-medium">{user?.firstName || user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href="/api/logout">
                  <LogOut className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full pt-4">
              <nav className="flex-1 px-4 space-y-2">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("overview")}
                >
                  <Home className="h-4 w-4" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "ingest" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("ingest")}
                >
                  <Upload className="h-4 w-4" />
                  Ingest
                </Button>
                <Button
                  variant={activeTab === "extract" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("extract")}
                >
                  <FileSearch className="h-4 w-4" />
                  Extract
                </Button>
                <Button
                  variant={activeTab === "classify" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("classify")}
                >
                  <Brain className="h-4 w-4" />
                  Classify
                </Button>
                <Button
                  variant={activeTab === "route" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("route")}
                >
                  <Route className="h-4 w-4" />
                  Route
                </Button>
                <Button
                  variant={activeTab === "analytics" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                          <p className="text-3xl font-bold">{stats?.total || 0}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                      </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Processed</p>
                          <p className="text-3xl font-bold text-green-600">{stats?.processed || 0}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Processing</p>
                          <p className="text-3xl font-bold text-blue-600">{stats?.processing || 0}</p>
                        </div>
                        <Zap className="h-8 w-8 text-blue-500" />
                      </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Failed</p>
                          <p className="text-3xl font-bold text-red-600">{stats?.failed || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-red-500" />
                      </div>
                    </GlassCard>
                  </div>

                  {/* Processing Pipeline Overview */}
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Processing Pipeline Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { stage: 1, name: "Ingest", icon: Upload, count: documents.filter(d => d.currentStage >= 1).length },
                        { stage: 2, name: "Extract", icon: FileSearch, count: documents.filter(d => d.currentStage >= 2).length },
                        { stage: 3, name: "Classify", icon: Brain, count: documents.filter(d => d.currentStage >= 3).length },
                        { stage: 4, name: "Route", icon: Route, count: documents.filter(d => d.currentStage >= 4).length },
                      ].map((stage) => (
                        <Button
                          key={stage.stage}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center gap-2"
                          onClick={() => setActiveTab(stage.name.toLowerCase())}
                        >
                          <stage.icon className="h-6 w-6" />
                          <div className="text-center">
                            <p className="font-semibold">{stage.name}</p>
                            <p className="text-sm text-muted-foreground">{stage.count} docs</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Recent Documents */}
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
                    <DocumentGrid
                      documents={documents.slice(0, 6)}
                      onDocumentClick={handleDocumentClick}
                      onRetry={handleRetry}
                      onReprocess={handleReprocess}
                    />
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === "ingest" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Document Ingestion</h2>
                    <Badge variant="outline" className="px-3 py-1">
                      Stage 1 of 4
                    </Badge>
                  </div>
                  
                  <IngestPanel 
                    documents={documents}
                    onDocumentSelect={handleDocumentSelect}
                    selectedDocument={selectedDocument}
                  />
                </motion.div>
              )}

              {activeTab === "extract" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Text Extraction</h2>
                    <Badge variant="outline" className="px-3 py-1">
                      Stage 2 of 4
                    </Badge>
                  </div>
                  
                  <ExtractPanel 
                    documents={documents}
                    onDocumentSelect={handleDocumentSelect}
                    selectedDocument={selectedDocument}
                  />
                </motion.div>
              )}

              {activeTab === "classify" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Document Classification</h2>
                    <Badge variant="outline" className="px-3 py-1">
                      Stage 3 of 4
                    </Badge>
                  </div>
                  
                  <ClassifyPanel 
                    documents={documents}
                    onDocumentSelect={handleDocumentSelect}
                    selectedDocument={selectedDocument}
                  />
                </motion.div>
              )}

              {activeTab === "route" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Document Routing</h2>
                    <Badge variant="outline" className="px-3 py-1">
                      Stage 4 of 4
                    </Badge>
                  </div>
                  
                  <RoutePanel 
                    documents={documents}
                    onDocumentSelect={handleDocumentSelect}
                    selectedDocument={selectedDocument}
                  />
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Processing Status</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Completed</span>
                          <span className="font-semibold">{stats?.processed || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>In Progress</span>
                          <span className="font-semibold">{stats?.processing || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed</span>
                          <span className="font-semibold">{stats?.failed || 0}</span>
                        </div>
                      </div>
                    </GlassCard>
                    
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Stage Performance</h3>
                      <div className="space-y-3">
                        {[
                          { name: "Ingest", completed: documents.filter(d => d.stages.find(s => s.stage === 1)?.status === 'completed').length },
                          { name: "Extract", completed: documents.filter(d => d.stages.find(s => s.stage === 2)?.status === 'completed').length },
                          { name: "Classify", completed: documents.filter(d => d.stages.find(s => s.stage === 3)?.status === 'completed').length },
                          { name: "Route", completed: documents.filter(d => d.stages.find(s => s.stage === 4)?.status === 'completed').length },
                        ].map((stage) => (
                          <div key={stage.name} className="flex justify-between">
                            <span>{stage.name}</span>
                            <span className="font-semibold">{stage.completed}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AnimatedBackground>
  );
}