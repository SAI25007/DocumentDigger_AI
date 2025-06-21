import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Mail, X, CheckCircle } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileUpload: (files: FileList) => void;
  isUploading?: boolean;
  className?: string;
}

export function UploadZone({ onFileUpload, isUploading = false, className }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragOver(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragCounter(0);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  }, [onFileUpload]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Document Upload</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Connect Mailbox
          </Button>
        </div>
      </div>

      <GlassCard
        className={cn(
          "relative p-8 border-2 border-dashed transition-all duration-300",
          isDragOver 
            ? "border-blue-400 bg-blue-500/20 scale-105" 
            : "border-white/30 hover:border-white/50",
          isUploading && "pointer-events-none"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-6">
          {isUploading ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Upload className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Uploading...</h3>
                <p className="text-gray-400">Processing your document</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                {isDragOver ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                ) : (
                  <Upload className="w-8 h-8 text-white" />
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  {isDragOver ? "Drop files here" : "Drop files to upload"}
                </h3>
                <p className="text-gray-400">
                  Support for PDF, DOC, DOCX, and image files up to 50MB
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Files
                  </label>
                </Button>
                <span className="text-gray-400 text-sm">or drag and drop</span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Supported formats: PDF, Word documents, Images</p>
                <p>Maximum file size: 50MB per file</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Drag overlay */}
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400 rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-300 font-medium">Release to upload</p>
            </div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}