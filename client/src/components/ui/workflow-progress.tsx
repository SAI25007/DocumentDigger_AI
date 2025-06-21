import { motion } from "framer-motion";
import { ProcessingStage } from "./processing-stage";

interface WorkflowProgressProps {
  stages: Array<{
    stage: number;
    name: string;
    status: "pending" | "processing" | "completed" | "failed";
    timestamp?: string;
    duration?: string;
    confidence?: number;
  }>;
  currentStage?: number;
}

export function WorkflowProgress({ stages, currentStage }: WorkflowProgressProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-6">Processing Pipeline</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <ProcessingStage
              {...stage}
              isActive={currentStage === stage.stage}
            />
            
            {/* Connection Line */}
            {index < stages.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-white/20 to-transparent transform -translate-y-1/2 z-10">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: stage.status === "completed" ? "100%" : "0%" 
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}