import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Timer, AlertOctagon, CloudUpload, Search, Target, Rocket, Activity } from "lucide-react";
import type { DocumentWithStages } from "@shared/schema";

const stageConfig = [
  { 
    name: "Ingested", 
    icon: CloudUpload, 
    description: "File received and metadata extracted",
    color: "blue"
  },
  { 
    name: "Extracted", 
    icon: Search, 
    description: "Text and entities extracted using AI",
    color: "green"
  },
  { 
    name: "Classified", 
    icon: Target, 
    description: "Document type identified with confidence",
    color: "purple"
  },
  { 
    name: "Routed", 
    icon: Rocket, 
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
        return <CheckCircle2 className="w-5 h-5" />;
      case 'processing':
        return <Timer className="w-5 h-5 animate-pulse" />;
      case 'failed':
        return <AlertOctagon className="w-5 h-5" />;
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
    <Card className="hover:shadow-xl transition-all duration-300 animate-slide-right border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Processing Pipeline
          </span>
        </CardTitle>
        <p className="text-gray-600">Live workflow status</p>
      </CardHeader>
      <CardContent>
        {!selectedDocumentId ? (
          <div className="text-center text-gray-500 py-8 animate-fade-scale">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <p>Select a document to view its processing pipeline</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Loading pipeline...</span>
          </div>
        ) : document ? (
          <div className="animate-fade-scale">
            {/* Document Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <h3 className="font-medium text-gray-900 truncate">{(document as any).originalName}</h3>
              <p className="text-sm text-gray-500">
                Processing Stage {(document as any).currentStage}/4
              </p>
              {(document as any).documentType && (
                <p className="text-sm text-gray-600 mt-1">
                  Type: {(document as any).documentType}
                  {(document as any).confidence && ` (${(document as any).confidence}% confidence)`}
                </p>
              )}
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-4">
              {stageConfig.map((stage, index) => {
                const stageNumber = index + 1;
                const status = getStageStatus(stageNumber, document as any);
                const stageRecord = (document as any).stages?.find((s: any) => s.stage === stageNumber);
                
                return (
                  <div 
                    key={stageNumber} 
                    className={`flex items-center p-3 rounded-xl transition-all duration-300 ${
                      status === 'processing' ? 'bg-blue-50 border border-blue-200 animate-pulse' : 
                      status === 'completed' ? 'bg-green-50 border border-green-200' :
                      status === 'failed' ? 'bg-red-50 border border-red-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getStageColors(status, stage.color)}`}>
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
                      <p className="text-xs text-gray-500 mb-1">
                        {getStatusText(status)}
                      </p>
                      {status === 'processing' && (
                        <Progress value={Math.random() * 40 + 30} className="h-1 mb-1" />
                      )}
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
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-primary">{Math.round(((document as any).currentStage / 4) * 100)}%</span>
              </div>
              <Progress 
                value={((document as any).currentStage / 4) * 100} 
                className="h-3 animate-progress"
                style={{'--progress-width': `${((document as any).currentStage / 4) * 100}%`} as any}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                {(document as any).currentStage}/4 stages completed
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <AlertOctagon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Document not found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
