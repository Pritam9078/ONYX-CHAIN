import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CyberpunkCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: "default" | "accent" | "primary" | "secondary";
  hoverEffect?: boolean;
}

export function CyberpunkCard({
  children,
  className = "",
  glow = true,
  variant = "default",
  hoverEffect = true,
  ...props
}: CyberpunkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get variables based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: 'rgba(255, 0, 153, 0.05)',
          borderColor: 'rgb(255, 0, 153)',
          glowColor: 'rgba(255, 0, 153, 0.3)'
        };
      case "secondary":
        return {
          backgroundColor: 'rgba(0, 200, 255, 0.05)',
          borderColor: 'rgb(0, 200, 255)',
          glowColor: 'rgba(0, 200, 255, 0.3)'
        };
      case "accent":
        return {
          backgroundColor: 'rgba(190, 0, 255, 0.05)',
          borderColor: 'rgb(190, 0, 255)',
          glowColor: 'rgba(190, 0, 255, 0.3)'
        };
      default:
        return {
          backgroundColor: 'rgba(20, 20, 30, 0.6)', // glass background
          borderColor: 'rgba(255, 255, 255, 0.08)',
          glowColor: 'rgba(255, 255, 255, 0.1)'
        };
    }
  };

  const variantStyles = getVariantStyles();
  
  // Card style with gradient border
  const cardStyle = {
    background: `${variantStyles.backgroundColor}`,
    boxShadow: isHovered && glow ? `0 0 20px ${variantStyles.glowColor}` : 'none',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    border: '1px solid transparent', // Needed for gradient background
    backgroundClip: 'padding-box', // So the gradient doesn't bleed into content
  };

  // Gradient border style using pseudo-element
  const gradientBorderStyle = {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: '1px', // Border width
    background: `linear-gradient(135deg, ${variantStyles.borderColor}, transparent 50%, ${variantStyles.borderColor})`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none' as const
  };

  // Animations
  const hoverAnimation = hoverEffect 
    ? { 
        scale: isHovered ? 1.02 : 1,
        transition: { duration: 0.3 }
      } 
    : {};

  return (
    <motion.div
      className={`glass-panel relative z-10 backdrop-blur-lg p-5 ${className}`}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={hoverAnimation}
      {...props}
    >
      {/* Gradient border pseudo-element */}
      <div className="absolute inset-0 rounded-lg z-0" style={gradientBorderStyle} />
      
      {/* Optional corner accents */}
      {variant !== "default" && (
        <>
          <div className="absolute w-4 h-4 border-t-2 border-l-2 left-0 top-0 rounded-tl-md" 
            style={{ borderColor: variantStyles.borderColor }} />
          <div className="absolute w-4 h-4 border-t-2 border-r-2 right-0 top-0 rounded-tr-md" 
            style={{ borderColor: variantStyles.borderColor }} />
          <div className="absolute w-4 h-4 border-b-2 border-l-2 left-0 bottom-0 rounded-bl-md" 
            style={{ borderColor: variantStyles.borderColor }} />
          <div className="absolute w-4 h-4 border-b-2 border-r-2 right-0 bottom-0 rounded-br-md" 
            style={{ borderColor: variantStyles.borderColor }} />
        </>
      )}
      
      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default CyberpunkCard;