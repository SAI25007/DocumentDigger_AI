import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CloudUpload, FileText, Mail, Sparkles, Zap } from "lucide-react";

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest('POST', '/api/documents/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Document uploaded and processing started",
      });
      onUploadSuccess();
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
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, Word documents, and images are allowed",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmailConnect = () => {
    toast({
      title: "Email Integration",
      description: "Email integration would connect to your mailbox here. This is a demo.",
    });
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 animate-slide-up border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <CloudUpload className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Document Upload
          </span>
        </CardTitle>
        <p className="text-gray-600">Drag and drop files or connect to your email system</p>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${
            isDragOver
              ? "border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 scale-105"
              : "border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:scale-102"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {/* Animated background elements */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              uploadMutation.isPending ? "gradient-primary animate-pulse" : "bg-gradient-to-br from-purple-100 to-blue-100"
            }`}>
              {uploadMutation.isPending ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <FileText className={`w-8 h-8 transition-colors duration-300 ${
                  isDragOver ? "text-purple-600" : "text-gray-400"
                }`} />
              )}
            </div>
            
            <p className="text-xl font-medium text-gray-700 mb-2">
              {uploadMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Processing your document...
                </span>
              ) : (
                "Drop files here to upload"
              )}
            </p>
            <p className="text-gray-500 mb-6">or click to browse</p>
            
            <div className="flex justify-center space-x-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
                disabled={uploadMutation.isPending}
                className="gradient-primary hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <CloudUpload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmailConnect();
                }}
                variant="secondary"
                disabled={uploadMutation.isPending}
                className="hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Connect Mailbox
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-6 flex items-center justify-center">
              <Zap className="w-3 h-3 mr-1" />
              Supported formats: PDF, Word documents, JPG, PNG (Max 50MB)
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </CardContent>
    </Card>
  );
}
