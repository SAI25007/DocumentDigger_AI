import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, Upload, Search, Target, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStageProps {
  stage: number;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  timestamp?: string;
  duration?: string;
  confidence?: number;
  isActive?: boolean;
}

const stageIcons = {
  1: Upload,
  2: Search,
  3: Target,
  4: Workflow,
};

const stageDetails = {
  1: { name: "Ingested", description: "File received and metadata extracted" },
  2: { name: "Extracted", description: "Text and entities extracted using AI" },
  3: { name: "Classified", description: "Document type identified with confidence" },
  4: { name: "Routed", description: "Delivered to target systems" },
};

export function ProcessingStage({ 
  stage, 
  name, 
  status, 
  timestamp, 
  duration, 
  confidence,
  isActive = false 
}: ProcessingStageProps) {
  const Icon = stageIcons[stage as keyof typeof stageIcons];
  const detail = stageDetails[stage as keyof typeof stageDetails];
  
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "processing":
        return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "from-green-500 to-emerald-500";
      case "processing":
        return "from-blue-500 to-cyan-500";
      case "failed":
        return "from-red-500 to-rose-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: stage * 0.1 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        isActive 
          ? "border-blue-400/50 bg-blue-500/10 shadow-lg shadow-blue-500/20" 
          : "border-white/20 bg-white/5 hover:bg-white/10"
      )}
    >
      {/* Stage Number and Icon */}
      <div className="flex items-center space-x-4 mb-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r shadow-lg",
          getStatusColor()
        )}>
          {status === "processing" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <Icon className="w-6 h-6 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {stage}. {detail.name}
            </h3>
            {getStatusIcon()}
          </div>
          <p className="text-sm text-gray-300 mt-1">{detail.description}</p>
        </div>
      </div>

      {/* Status Details */}
      {(timestamp || duration || confidence) && (
        <div className="space-y-2 text-xs text-gray-400">
          {timestamp && (
            <div className="flex items-center justify-between">
              <span>Completed:</span>
              <span className="text-blue-300">{timestamp}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center justify-between">
              <span>Duration:</span>
              <span className="text-green-300">{duration}</span>
            </div>
          )}
          {confidence && (
            <div className="flex items-center justify-between">
              <span>Confidence:</span>
              <span className="text-purple-300">{confidence}%</span>
            </div>
          )}
        </div>
      )}

      {/* Processing Animation */}
      {status === "processing" && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400/50 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.4)",
              "0 0 0 10px rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}