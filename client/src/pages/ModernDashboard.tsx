import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Upload, Zap, FileText, Users, TrendingUp, LogOut, Settings, Bell, Menu, Home, BarChart3, Monitor } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { UploadZone } from "@/components/ui/upload-zone";
import { WorkflowProgress } from "@/components/ui/workflow-progress";
import { DocumentGrid } from "@/components/ui/document-grid";
import { motion } from "framer-motion";
import type { DocumentWithStages } from "@shared/schema";

export default function ModernDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "uploads", label: "Uploads", icon: Upload },
    { id: "monitoring", label: "Monitoring", icon: Monitor },
    { id: "settings", label: "Settings", icon: Settings },
  ];

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
    <AnimatedBackground variant="default">
      <div className="min-h-screen">
        {/* Navigation Bar */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-white/10 backdrop-blur-md bg-white/5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Navigation */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">DocFlow AI</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        onClick={() => setActiveTab(item.id)}
                        className={`text-white hover:bg-white/10 ${
                          activeTab === item.id ? "bg-white/20" : ""
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-3">
                  {user?.profileImageUrl && (
                    <img
                      src={user.profileImageUrl}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-200 shadow-lg"
                    />
                  )}
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {user?.firstName || user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-white"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Stats */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Processing Speed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Optimal</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Queue Status</span>
                    <span className="text-blue-400 text-sm">12 pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Accuracy Rate</span>
                    <span className="text-purple-400 text-sm">99.2%</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  {stats && (
                    <>
                      <div className="text-center p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <div className="text-sm text-gray-300">Total Documents</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-500/20 rounded-lg">
                          <div className="text-lg font-semibold text-green-400">{stats.processed}</div>
                          <div className="text-xs text-gray-300">Processed</div>
                        </div>
                        <div className="text-center p-3 bg-orange-500/20 rounded-lg">
                          <div className="text-lg font-semibold text-orange-400">{stats.processing}</div>
                          <div className="text-xs text-gray-300">Processing</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {activeTab === "dashboard" && (
                <>
                  {/* Upload Zone */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <UploadZone
                      onFileUpload={handleFileUpload}
                      isUploading={uploadMutation.isPending}
                    />
                  </motion.div>

                  {/* Workflow Progress */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <GlassCard className="p-6">
                      <WorkflowProgress
                        stages={getWorkflowStages(selectedDocument || documents[0])}
                        currentStage={selectedDocument?.stages.find(s => s.status === "processing")?.stage}
                      />
                    </GlassCard>
                  </motion.div>

                  {/* Document Grid */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <DocumentGrid
                      documents={documents}
                      onDocumentClick={handleDocumentClick}
                      onRetry={handleRetry}
                      onReprocess={handleReprocess}
                    />
                  </motion.div>
                </>
              )}

              {activeTab === "uploads" && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-6"
                >
                  <UploadZone
                    onFileUpload={handleFileUpload}
                    isUploading={uploadMutation.isPending}
                  />
                  <DocumentGrid
                    documents={documents}
                    onDocumentClick={handleDocumentClick}
                    onRetry={handleRetry}
                    onReprocess={handleReprocess}
                  />
                </motion.div>
              )}

              {activeTab === "monitoring" && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-6"
                >
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-bold text-white mb-6">System Monitoring</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Processing Queue</h3>
                        <div className="space-y-2">
                          {documents.filter(d => d.status === "processing").map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <span className="text-gray-300 truncate">{doc.filename}</span>
                              <Badge variant="outline" className="border-blue-400 text-blue-400">
                                Processing
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Recent Failures</h3>
                        <div className="space-y-2">
                          {documents.filter(d => d.status === "failed").map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                              <span className="text-gray-300 truncate">{doc.filename}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetry(doc.id)}
                                className="border-red-400 text-red-400 hover:bg-red-500/20"
                              >
                                Retry
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-6"
                >
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Processing Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Auto-classification</span>
                            <div className="w-12 h-6 bg-blue-500 rounded-full p-1">
                              <div className="w-4 h-4 bg-white rounded-full transition-transform translate-x-6"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Real-time notifications</span>
                            <div className="w-12 h-6 bg-blue-500 rounded-full p-1">
                              <div className="w-4 h-4 bg-white rounded-full transition-transform translate-x-6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Account</h3>
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="border-red-400 text-red-400 hover:bg-red-500/20"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}