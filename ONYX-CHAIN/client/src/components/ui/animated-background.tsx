import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  color: string;
  duration: number;
  delay: number;
}

interface AnimatedBackgroundProps {
  particleCount?: number;
  className?: string;
}

export function AnimatedBackground({ 
  particleCount = 50,
  className = ''
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const generateNeonColor = () => {
    const colors = [
      'rgba(255, 0, 153, 0.6)', // magenta
      'rgba(0, 200, 255, 0.6)', // cyan
      'rgba(190, 0, 255, 0.6)', // purple
      'rgba(0, 255, 128, 0.6)', // green
      'rgba(255, 80, 0, 0.6)'   // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Calculate and update dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate particles when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const newParticles: Particle[] = Array.from({ length: particleCount }).map((_, index) => {
      return {
        id: index,
        size: Math.random() * 6 + 1,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        color: generateNeonColor(),
        duration: Math.random() * 60 + 30,
        delay: Math.random() * 10
      };
    });
    
    setParticles(newParticles);
  }, [particleCount, dimensions]);

  // Render gradient background with floating particles
  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden z-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #080010 0%, #100020 50%, #080010 100%)',
      }}
    >
      {/* Grid lines overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Digital circuit pattern overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10 H90 V90 H10 V10 M30 30 H70 V70 H30 V30 M50 10 V30 M50 70 V90 M10 50 H30 M70 50 H90\' stroke=\'%23FFFFFF\' fill=\'none\' stroke-width=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Glowing particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none filter blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            x: particle.x,
            y: particle.y,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            x: [particle.x, particle.x + (Math.random() * 100 - 50), particle.x],
            y: [particle.y, particle.y + (Math.random() * 100 - 50), particle.y],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: particle.delay
          }}
        />
      ))}

      {/* Horizontal scan line effect */}
      <motion.div
        className="absolute h-[2px] w-full bg-cyan-500 opacity-20 z-10 blur-sm"
        animate={{
          y: [0, dimensions.height],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export default AnimatedBackground;