import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "dark";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl border border-white/20 backdrop-blur-md transition-all duration-300",
          {
            "bg-white/10 shadow-lg hover:shadow-xl": variant === "default",
            "bg-white/20 shadow-xl hover:shadow-2xl": variant === "elevated",
            "bg-black/10 shadow-lg hover:shadow-xl": variant === "dark",
          },
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };