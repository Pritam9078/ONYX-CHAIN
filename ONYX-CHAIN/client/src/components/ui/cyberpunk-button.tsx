import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CyberpunkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
  glow?: boolean;
}

export function CyberpunkButton({
  children,
  className = "",
  variant = "primary",
  size = "default",
  glow = true,
  ...props
}: CyberpunkButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Base classes
  let baseClasses = "relative inline-flex items-center justify-center font-medium tracking-wider uppercase whitespace-nowrap transition-all rounded-md ";
  
  // Size classes
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 h-8",
    default: "text-sm px-4 py-2 h-10",
    lg: "text-md px-6 py-3 h-12"
  };
  
  // Get variables based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: 'rgba(255, 0, 153, 0.2)',
          borderColor: 'rgb(255, 0, 153)',
          textShadowColor: 'rgb(255, 0, 153)',
          glowColor: 'rgba(255, 0, 153, 0.7)',
          textClass: 'text-white'
        };
      case "secondary":
        return {
          backgroundColor: 'rgba(0, 200, 255, 0.2)',
          borderColor: 'rgb(0, 200, 255)',
          textShadowColor: 'rgb(0, 200, 255)',
          glowColor: 'rgba(0, 200, 255, 0.7)',
          textClass: 'text-white'
        };
      case "outline":
        return {
          backgroundColor: 'transparent',
          borderColor: 'rgb(190, 0, 255)',
          textShadowColor: 'rgb(190, 0, 255)',
          glowColor: 'rgba(190, 0, 255, 0.7)',
          textClass: 'text-white'
        };
      case "destructive":
        return {
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          borderColor: 'rgb(255, 0, 0)',
          textShadowColor: 'rgb(255, 0, 0)',
          glowColor: 'rgba(255, 0, 0, 0.7)',
          textClass: 'text-white'
        };
      default:
        return {
          backgroundColor: 'rgba(255, 0, 153, 0.2)',
          borderColor: 'rgb(255, 0, 153)',
          textShadowColor: 'rgb(255, 0, 153)',
          glowColor: 'rgba(255, 0, 153, 0.7)',
          textClass: 'text-white'
        };
    }
  };

  const variantStyles = getVariantStyles();
  
  // Apply styles
  const buttonStyle = {
    backgroundColor: variantStyles.backgroundColor,
    border: `1px solid ${variantStyles.borderColor}`,
    boxShadow: isHovered && glow ? `0 0 15px ${variantStyles.glowColor}` : 'none',
  };
  
  const textStyle = {
    textShadow: isHovered ? `0 0 5px ${variantStyles.textShadowColor}` : 'none',
  };
  
  // Glitch effect on hover
  const glitchVariants = {
    normal: {
      x: 0,
      textShadow: `0 0 0 transparent`
    },
    hover: {
      x: [0, -2, 2, -1, 1, 0],
      textShadow: [
        `0 0 0 transparent`,
        `1px 0 0 ${variantStyles.textShadowColor}, -1px 0 0 cyan`,
        `-1px 0 0 ${variantStyles.textShadowColor}, 1px 0 0 cyan`,
        `1px 0 0 ${variantStyles.textShadowColor}, -1px 0 0 cyan`,
        `0 0 0 transparent`
      ],
      transition: {
        duration: 0.5,
        repeat: isHovered ? Infinity : 0,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <motion.button
      className={`${baseClasses} ${sizeClasses[size]} ${variantStyles.textClass} ${className}`}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      initial="normal"
      animate={isHovered ? "hover" : "normal"}
      {...props}
    >
      {/* Pseudo-element for glitch border effect */}
      <div className="absolute inset-0 rounded-md" 
        style={{ 
          border: `1px solid ${variantStyles.borderColor}`,
          filter: isHovered ? 'blur(2px)' : 'none',
          opacity: isHovered ? 0.7 : 0,
          transition: 'all 0.3s ease'
        }} 
      />
      
      {/* Button text with glitch effect */}
      <motion.span 
        style={textStyle}
        variants={glitchVariants}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}

export default CyberpunkButton;