import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Eye, Sparkles, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DocumentWithStages } from "@shared/schema";
import { useWebSocket } from "@/hooks/useWebSocket";

interface DocumentTableProps {
  documents: DocumentWithStages[];
  loading: boolean;
  onRefetch: () => void;
}

export default function DocumentTable({ documents, loading, onRefetch }: DocumentTableProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  
  // Listen for real-time updates
  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'document_update') {
        onRefetch();
      }
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      processing: "default",
      completed: "success",
      failed: "destructive",
    } as const;

    const labels = {
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getDocumentTypeColor = (type: string | null) => {
    if (!type) return "bg-gray-100 text-gray-800";
    
    const colors = {
      Contract: "bg-blue-100 text-blue-800",
      Invoice: "bg-green-100 text-green-800",
      Receipt: "bg-yellow-100 text-yellow-800",
      "Legal Document": "bg-purple-100 text-purple-800",
      "Purchase Order": "bg-orange-100 text-orange-800",
    };
    
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleRowClick = (documentId: number) => {
    setSelectedDocumentId(documentId);
    // Emit event for pipeline component to listen
    window.dispatchEvent(new CustomEvent('documentSelected', { 
      detail: { documentId } 
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 animate-slide-left border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Recent Documents
          </span>
        </CardTitle>
        <p className="text-gray-600">Monitor document processing status and manage workflows</p>
      </CardHeader>
      <CardContent className="p-0">
        {documents.length === 0 ? (
          <div className="text-center py-12 px-6 animate-fade-scale">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type & Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-100">
                {documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 cursor-pointer transition-all duration-300 animate-slide-up ${
                      selectedDocumentId === doc.id ? "bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-400" : ""
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={() => handleRowClick(doc.id)}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                            {doc.originalName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(doc.fileSize / 1024 / 1024).toFixed(1)} MB • {doc.mimeType.split('/')[1].toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-2">
                        {doc.documentType ? (
                          <Badge 
                            variant="outline" 
                            className={`${getDocumentTypeColor(doc.documentType)} shadow-sm`}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {doc.documentType}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            <Clock className="w-3 h-3 mr-1 animate-pulse" />
                            Processing...
                          </Badge>
                        )}
                        <div className="w-full">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round((doc.currentStage / 4) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(doc.currentStage / 4) * 100} 
                            className="h-2"
                          />
                        </div>
                        {doc.confidence && (
                          <div className="text-xs text-gray-500">
                            Confidence: {doc.confidence}%
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(doc.updatedAt || doc.createdAt), { 
                        addSuffix: true 
                      })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(doc.id);
                        }}
                        className="gradient-primary text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
