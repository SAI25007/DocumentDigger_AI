import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, AlertCircle, Upload, FileText, Tag, Send } from "lucide-react";
import type { DocumentWithStages } from "@shared/schema";

const stageConfig = [
  { 
    name: "Ingested", 
    icon: Upload, 
    description: "File received and metadata extracted",
    color: "blue"
  },
  { 
    name: "Extracted", 
    icon: FileText, 
    description: "Text and entities extracted using AI",
    color: "green"
  },
  { 
    name: "Classified", 
    icon: Tag, 
    description: "Document type identified with confidence",
    color: "purple"
  },
  { 
    name: "Routed", 
    icon: Send, 
    description: "Delivered to target systems",
    color: "orange"
  },
];

export default function ProcessingPipeline() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  // Listen for document selection events
  useEffect(() => {
    const handleDocumentSelected = (event: CustomEvent) => {
      setSelectedDocumentId(event.detail.documentId);
    };

    window.addEventListener('documentSelected', handleDocumentSelected as EventListener);
    return () => {
      window.removeEventListener('documentSelected', handleDocumentSelected as EventListener);
    };
  }, []);

  // Fetch document details when selected
  const { data: document, isLoading } = useQuery({
    queryKey: [`/api/documents/${selectedDocumentId}`],
    enabled: !!selectedDocumentId,
    retry: false,
  });

  const getStageStatus = (stage: number, doc: DocumentWithStages) => {
    const stageRecord = doc.stages.find(s => s.stage === stage);
    if (!stageRecord) return 'pending';
    return stageRecord.status;
  };

  const getStageIcon = (status: string, StageIcon: any) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'processing':
        return <Clock className="w-5 h-5 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <StageIcon className="w-5 h-5" />;
    }
  };

  const getStageColors = (status: string, baseColor: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'processing':
        return 'bg-blue-100 text-blue-600';
      case 'failed':
        return 'bg-red-100 text-red-600';
      case 'pending':
        return 'bg-gray-100 text-gray-400';
      default:
        return 'bg-gray-100 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'In Progress...';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Pipeline</CardTitle>
        <p className="text-gray-600">Live workflow status</p>
      </CardHeader>
      <CardContent>
        {!selectedDocumentId ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Select a document to view its processing pipeline</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Loading pipeline...</span>
          </div>
        ) : document ? (
          <div>
            {/* Document Info */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 truncate">{document.originalName}</h3>
              <p className="text-sm text-gray-500">
                Processing Stage {document.currentStage}/4
              </p>
              {document.documentType && (
                <p className="text-sm text-gray-600 mt-1">
                  Type: {document.documentType}
                  {document.confidence && ` (${document.confidence}% confidence)`}
                </p>
              )}
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-4">
              {stageConfig.map((stage, index) => {
                const stageNumber = index + 1;
                const status = getStageStatus(stageNumber, document);
                const stageRecord = document.stages.find(s => s.stage === stageNumber);
                
                return (
                  <div 
                    key={stageNumber} 
                    className={`flex items-center ${status === 'processing' ? 'animate-pulse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStageColors(status, stage.color)}`}>
                      {getStageIcon(status, stage.icon)}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`text-sm font-medium ${
                        status === 'completed' ? 'text-green-800' : 
                        status === 'processing' ? 'text-blue-800' : 
                        status === 'failed' ? 'text-red-800' : 
                        'text-gray-500'
                      }`}>
                        {stage.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getStatusText(status)}
                      </p>
                      {stageRecord?.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {stageRecord.errorMessage}
                        </p>
                      )}
                      {stageRecord?.details && stageNumber === 4 && stageRecord.details.routedTo && (
                        <p className="text-xs text-gray-600 mt-1">
                          Routed to: {stageRecord.details.routedTo}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Processing Progress */}
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(document.currentStage / 4) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {document.currentStage}/4 stages completed
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Document not found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
