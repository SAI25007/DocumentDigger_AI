import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, AlertCircle, Eye, RotateCcw, ArrowRight } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface Document {
  id: number;
  filename: string;
  type?: string;
  status: string;
  createdAt: Date;
  stages: Array<{
    stage: number;
    status: string;
    completedAt?: Date;
  }>;
}

interface DocumentGridProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
  onRetry: (docId: number) => void;
  onReprocess: (docId: number) => void;
}

export function DocumentGrid({ documents, onDocumentClick, onRetry, onReprocess }: DocumentGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getProgressPercentage = (stages: Document['stages']) => {
    const completedStages = stages.filter(s => s.status === "completed").length;
    return (completedStages / 4) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Recent Documents</h2>
        <Badge variant="outline" className="border-white/20 text-white">
          {documents.length} documents
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer group">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {doc.filename}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {doc.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(doc.status)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-blue-300">{Math.round(getProgressPercentage(doc.stages))}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(doc.stages)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={getStatusColor(doc.status) as any}
                    className={cn(
                      "text-xs",
                      doc.status === "completed" && "bg-green-500/20 text-green-300 border-green-500/30",
                      doc.status === "processing" && "bg-blue-500/20 text-blue-300 border-blue-500/30",
                      doc.status === "failed" && "bg-red-500/20 text-red-300 border-red-500/30"
                    )}
                  >
                    {doc.status}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDocumentClick(doc);
                    }}
                    className="flex-1 text-blue-300 hover:text-white hover:bg-blue-500/20"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  {doc.status === "failed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry(doc.id);
                      }}
                      className="flex-1 text-orange-300 hover:text-white hover:bg-orange-500/20"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReprocess(doc.id);
                    }}
                    className="flex-1 text-purple-300 hover:text-white hover:bg-purple-500/20"
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Route
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {documents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No documents yet</h3>
          <p className="text-gray-400">Upload your first document to get started</p>
        </motion.div>
      )}
    </div>
  );
}