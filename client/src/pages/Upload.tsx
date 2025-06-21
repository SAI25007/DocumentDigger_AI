import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UploadZone } from "@/components/ui/upload-zone";
import { motion } from "framer-motion";

export default function UploadPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: number;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    id?: number;
  }>>([]);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const promises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiRequest({
          endpoint: '/api/upload',
          method: 'POST',
          body: formData,
        });
        
        return { file, data: response };
      });
      
      return Promise.all(promises);
    },
    onMutate: (files) => {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        status: 'uploading' as const
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    },
    onSuccess: (results) => {
      results.forEach(({ file, data }) => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name && f.status === 'uploading' 
              ? { ...f, status: 'processing', id: data.id }
              : f
          )
        );
      });
      
      toast({
        title: "Upload Successful",
        description: `${results.length} file(s) uploaded and processing started`,
      });
      
      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error) => {
      setUploadedFiles(prev => 
        prev.map(f => f.status === 'uploading' ? { ...f, status: 'failed' } : f)
      );
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (files: FileList) => {
    if (files.length === 0) return;
    uploadMutation.mutate(files);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'processing':
        return <Clock className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="secondary">Uploading</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Document Upload
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Upload documents to start the 4-stage processing pipeline: Ingest → Extract → Classify → Route
          </motion.p>
        </div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Drag and drop files here or click to browse. Supports PDF, DOCX, and image files up to 50MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadZone 
                onFileUpload={handleFileUpload}
                isUploading={uploadMutation.isPending}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload History */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>Recent file uploads and their processing status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(file.status)}
                        {file.id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/dashboard?doc=${file.id}`}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Processing Pipeline Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Processing Pipeline</CardTitle>
              <CardDescription>
                Once uploaded, documents automatically go through these stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { stage: 1, name: "Ingest", description: "File validation and metadata extraction" },
                  { stage: 2, name: "Extract", description: "Text and data extraction using OCR/parsing" },
                  { stage: 3, name: "Classify", description: "AI-powered document classification" },
                  { stage: 4, name: "Route", description: "Automatic routing to target systems" }
                ].map((step) => (
                  <div key={step.stage} className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      {step.stage}
                    </div>
                    <h3 className="font-semibold mb-1">{step.name}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
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