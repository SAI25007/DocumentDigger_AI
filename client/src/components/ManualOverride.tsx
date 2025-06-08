import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { RotateCcw, Tag, Send, Settings } from "lucide-react";

interface ManualOverrideProps {
  onAction: () => void;
}

export default function ManualOverride({ onAction }: ManualOverrideProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const { toast } = useToast();

  // Listen for document selection events
  useEffect(() => {
    const handleDocumentSelected = (event: CustomEvent) => {
      setSelectedDocumentId(event.detail.documentId);
      setShowPanel(true);
    };

    window.addEventListener('documentSelected', handleDocumentSelected as EventListener);
    return () => {
      window.removeEventListener('documentSelected', handleDocumentSelected as EventListener);
    };
  }, []);

  const reprocessMutation = useMutation({
    mutationFn: async ({ documentId, stage }: { documentId: number; stage: number }) => {
      const response = await apiRequest('POST', `/api/documents/${documentId}/reprocess`, { stage });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reprocessing Started",
        description: "Document has been queued for reprocessing",
      });
      onAction();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      
      toast({
        title: "Reprocessing Failed",
        description: error.message || "Failed to start reprocessing",
        variant: "destructive",
      });
    },
  });

  const handleReExtract = () => {
    if (!selectedDocumentId) {
      toast({
        title: "No Document Selected",
        description: "Please select a document first",
        variant: "destructive",
      });
      return;
    }
    
    reprocessMutation.mutate({ documentId: selectedDocumentId, stage: 2 });
  };

  const handleReClassify = () => {
    if (!selectedDocumentId) {
      toast({
        title: "No Document Selected",
        description: "Please select a document first",
        variant: "destructive",
      });
      return;
    }
    
    reprocessMutation.mutate({ documentId: selectedDocumentId, stage: 3 });
  };

  const handleRouteTo = () => {
    if (!selectedDocumentId) {
      toast({
        title: "No Document Selected",
        description: "Please select a document first",
        variant: "destructive",
      });
      return;
    }

    const systems = [
      'ERP System',
      'Document Management System',
      'Accounting Software',
      'CRM System',
      'Archive Storage'
    ];
    
    const selectedSystem = prompt(
      `Route document to which system?\n\n${systems.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nEnter the number (1-${systems.length}):`
    );
    
    if (selectedSystem) {
      const systemIndex = parseInt(selectedSystem) - 1;
      if (systemIndex >= 0 && systemIndex < systems.length) {
        toast({
          title: "Document Routed",
          description: `Document routed to: ${systems[systemIndex]}`,
        });
        
        // Start reprocessing from routing stage
        reprocessMutation.mutate({ documentId: selectedDocumentId, stage: 4 });
      } else {
        toast({
          title: "Invalid Selection",
          description: "Please select a valid system number",
          variant: "destructive",
        });
      }
    }
  };

  const handleFullReprocess = () => {
    if (!selectedDocumentId) {
      toast({
        title: "No Document Selected",
        description: "Please select a document first",
        variant: "destructive",
      });
      return;
    }
    
    reprocessMutation.mutate({ documentId: selectedDocumentId, stage: 1 });
  };

  if (!showPanel) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Manual Override Controls</span>
        </CardTitle>
        <p className="text-gray-600">Intervene in document processing when needed</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={handleFullReprocess}
            disabled={reprocessMutation.isPending}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Full Reprocess
          </Button>
          
          <Button
            onClick={handleReExtract}
            disabled={reprocessMutation.isPending}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Re-extract Text
          </Button>
          
          <Button
            onClick={handleReClassify}
            disabled={reprocessMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Tag className="w-4 h-4 mr-2" />
            Re-classify
          </Button>
          
          <Button
            onClick={handleRouteTo}
            disabled={reprocessMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Route To System
          </Button>
        </div>
        
        {selectedDocumentId && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Selected Document ID: {selectedDocumentId}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Use the controls above to reprocess this document from any stage
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
