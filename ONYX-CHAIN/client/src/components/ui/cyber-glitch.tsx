import React, { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CyberGlitchProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glitchInterval?: number;
  intensity?: "low" | "medium" | "high";
}

export function CyberGlitch({
  children,
  className,
  glitchInterval = 3000,
  intensity = "medium",
  ...props
}: CyberGlitchProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    // Initial glitch effect
    setIsGlitching(true);
    const initialTimer = setTimeout(() => {
      setIsGlitching(false);
    }, 500);
    
    // Set up recurring glitch effect
    const interval = setInterval(() => {
      setIsGlitching(true);
      
      setTimeout(() => {
        setIsGlitching(false);
      }, 500);
    }, glitchInterval);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [glitchInterval]);
  
  // Define glitch intensity styles
  const getGlitchStyles = () => {
    switch (intensity) {
      case "low":
        return isGlitching ? "animate-glitch-low" : "";
      case "high":
        return isGlitching ? "animate-glitch-high" : "";
      case "medium":
      default:
        return isGlitching ? "animate-glitch-medium" : "";
    }
  };
  
  return (
    <div
      className={cn(
        "relative inline-block text-[#00FFFF] overflow-hidden",
        getGlitchStyles(),
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {isGlitching && (
        <>
          <span className="absolute inset-0 text-[#FF00FF] left-[-2px] opacity-70">
            {children}
          </span>
          <span className="absolute inset-0 text-[#00FFFF] left-[2px] top-[1px] opacity-70">
            {children}
          </span>
        </>
      )}
    </div>
  );
}

// Add these animations to your global CSS or tailwind.config.ts
// @keyframes glitchLow {
//   0%, 100% { transform: translate(0); }
//   20% { transform: translate(-1px, 1px); }
//   40% { transform: translate(-1px, -1px); }
//   60% { transform: translate(1px, 1px); }
//   80% { transform: translate(1px, -1px); }
// }
// 
// @keyframes glitchMedium {
//   0%, 100% { transform: translate(0); }
//   20% { transform: translate(-2px, 2px); }
//   40% { transform: translate(-2px, -2px); }
//   60% { transform: translate(2px, 2px); }
//   80% { transform: translate(2px, -2px); }
// }
// 
// @keyframes glitchHigh {
//   0%, 100% { transform: translate(0); }
//   20% { transform: translate(-3px, 3px); }
//   40% { transform: translate(-3px, -3px); }
//   60% { transform: translate(3px, 3px); }
//   80% { transform: translate(3px, -3px); }
// }