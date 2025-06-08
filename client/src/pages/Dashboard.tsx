import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Brain, CloudUpload, Timer, CheckCircle2, AlertOctagon, TrendingUp, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentTable from "@/components/DocumentTable";
import ProcessingPipeline from "@/components/ProcessingPipeline";
import ManualOverride from "@/components/ManualOverride";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  // Fetch documents
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/documents"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>
      
      {/* Top Navigation Bar */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 animate-slide-up">
            <div className="flex items-center">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                DocFlow AI
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="User Avatar" 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200 shadow-lg"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName || user?.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 hover:bg-purple-50 transition-all duration-300"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Processing Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your document processing pipeline</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-all duration-300 animate-slide-up border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Documents</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? "..." : (stats as any)?.total || 0}
                  </p>
                  <div className="mt-3">
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">85% efficiency</p>
                  </div>
                </div>
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <CloudUpload className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 animate-slide-up border-0 bg-white/70 backdrop-blur-sm" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Processed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statsLoading ? "..." : (stats as any)?.processed || 0}
                  </p>
                  <div className="mt-3">
                    <Progress value={92} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">92% success rate</p>
                  </div>
                </div>
                <div className="w-14 h-14 gradient-success rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 animate-slide-up border-0 bg-white/70 backdrop-blur-sm" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {statsLoading ? "..." : (stats as any)?.processing || 0}
                  </p>
                  <div className="mt-3">
                    <Progress value={68} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">68% completion</p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Timer className="w-7 h-7 text-white animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 animate-slide-up border-0 bg-white/70 backdrop-blur-sm" style={{animationDelay: '0.3s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Failed</p>
                  <p className="text-3xl font-bold text-red-600">
                    {statsLoading ? "..." : (stats as any)?.failed || 0}
                  </p>
                  <div className="mt-3">
                    <Progress value={8} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">8% error rate</p>
                  </div>
                </div>
                <div className="w-14 h-14 gradient-error rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertOctagon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <DocumentUpload onUploadSuccess={refetchDocuments} />

        {/* Processing Pipeline & Document List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Document List */}
          <div className="lg:col-span-2">
            <DocumentTable 
              documents={documents || []} 
              loading={documentsLoading}
              onRefetch={refetchDocuments}
            />
          </div>

          {/* Processing Pipeline */}
          <div>
            <ProcessingPipeline />
          </div>
        </div>

        {/* Manual Override Panel */}
        <ManualOverride onAction={refetchDocuments} />
      </div>
    </div>
  );
}
