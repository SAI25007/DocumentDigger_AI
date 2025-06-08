import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, MoreHorizontal } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Recent Documents</span>
        </CardTitle>
        <p className="text-gray-600">Monitor document processing status and manage workflows</p>
      </CardHeader>
      <CardContent className="p-0">
        {documents.length === 0 ? (
          <div className="text-center py-12 px-6">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedDocumentId === doc.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleRowClick(doc.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.originalName}
                          </div>
                          {doc.confidence && (
                            <div className="text-xs text-gray-500">
                              Confidence: {doc.confidence}%
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.documentType ? (
                        <Badge 
                          variant="outline" 
                          className={getDocumentTypeColor(doc.documentType)}
                        >
                          {doc.documentType}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">Processing...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(doc.updatedAt || doc.createdAt), { 
                        addSuffix: true 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(doc.id);
                        }}
                        className="text-primary hover:text-blue-700"
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
