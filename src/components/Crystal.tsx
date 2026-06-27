import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { CrystalTheme, ScanState } from '../types';

interface CrystalProps {
  theme: CrystalTheme;
  scanState: ScanState;
  healthPercent: number; // 0 (full clutter) to 100 (fully optimized/clear)
  onInteractiveClick?: () => void;
  rotationSpeedSetting: 'slow' | 'normal' | 'fast';
  glowIntensitySetting: 'low' | 'medium' | 'high';
}

export default function Crystal({
  theme,
  scanState,
  healthPercent,
  onInteractiveClick,
  rotationSpeedSetting,
  glowIntensitySetting,
}: CrystalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Set up 3D rotation feel using Framer Motion drag gestures
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 1 };
  const rX = useSpring(rotateX, springConfig);
  const rY = useSpring(rotateY, springConfig);

  // Dynamic light source position depending on drag rotation
  const lightX = useTransform(rY, [-45, 45], ['20%', '80%']);
  const lightY = useTransform(rX, [-45, 45], ['20%', '80%']);

  // Handle manual rotation reset on drag end
  const handleDragEnd = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Determine color palettes based on selected crystal theme or system health state
  // If scanState is scanned or cleaning and health is low, blend in warm "clutter" particles & color overlays
  const getThemePalette = () => {
    // Determine base theme colors
    switch (theme) {
      case 'emerald':
        return {
          primary: '#10b981', // emerald-500
          secondary: '#34d399', // emerald-400
          accent: '#059669', // emerald-600
          coreGlow: 'rgba(16, 185, 129, 0.45)',
          refraction: 'rgba(110, 231, 183, 0.3)',
        };
      case 'amber':
        return {
          primary: '#f59e0b', // amber-500
          secondary: '#fbbf24', // amber-400
          accent: '#d97706', // amber-600
          coreGlow: 'rgba(245, 158, 11, 0.45)',
          refraction: 'rgba(253, 230, 138, 0.3)',
        };
      case 'quartz':
        return {
          primary: '#ec4899', // pink-500
          secondary: '#f472b6', // pink-400
          accent: '#db2777', // pink-600
          coreGlow: 'rgba(236, 72, 153, 0.45)',
          refraction: 'rgba(249, 168, 212, 0.3)',
        };
      case 'obsidian':
        return {
          primary: '#6366f1', // indigo-500
          secondary: '#a5b4fc', // indigo-300
          accent: '#312e81', // indigo-900/obsidian purple
          coreGlow: 'rgba(99, 102, 241, 0.35)',
          refraction: 'rgba(199, 210, 254, 0.25)',
        };
      case 'sapphire':
      default:
        return {
          primary: '#3b82f6', // blue-500
          secondary: '#60a5fa', // blue-400
          accent: '#2563eb', // blue-600
          coreGlow: 'rgba(59, 130, 246, 0.45)',
          refraction: 'rgba(147, 197, 253, 0.3)',
        };
    }
  };

  const palette = getThemePalette();

  // Dynamic values depending on health status
  // 100% health -> crystal is pristine.
  // 0% health -> crystal is "fogged up" or clogged with rust/clutter color.
  const clutterBlend = Math.max(0, 100 - healthPercent) / 100;
  
  // Custom blended crystal colors
  const crystalCoreColor = `rgba(${
    clutterBlend * 220 + (1 - clutterBlend) * parseInt(palette.primary.slice(1, 3), 16)
  }, ${
    clutterBlend * 100 + (1 - clutterBlend) * parseInt(palette.primary.slice(3, 5), 16)
  }, ${
    clutterBlend * 30 + (1 - clutterBlend) * parseInt(palette.primary.slice(5, 7), 16)
  }, 0.85)`;

  // Glow intensities
  const glowShadows = {
    low: '0 0 15px 2px',
    medium: '0 0 30px 4px',
    high: '0 0 60px 8px',
  };
  const baseGlowShadow = glowShadows[glowIntensitySetting];

  // Base rotation speed (degrees per frame approx)
  const rotationDurations = {
    slow: 24,
    normal: 12,
    fast: 6,
  };
  const rotDuration = rotationDurations[rotationSpeedSetting];

  // Define SVG crystal facets
  // Coordinates are centered around (0,0) inside a viewbox of -100 to 100
  const facets = [
    // Top-Center Facet
    { points: '0,-95 -25,-35 0,-15', fill: 'url(#gradient-top-center)', opacity: 0.95 },
    // Top-Left Facet
    { points: '-25,-35 -65,-35 0,-95', fill: 'url(#gradient-top-left)', opacity: 0.8 },
    // Top-Right Facet
    { points: '0,-95 65,-35 25,-35', fill: 'url(#gradient-top-right)', opacity: 0.85 },
    // Top-Inner Right Facet
    { points: '0,-95 25,-35 0,-15', fill: 'url(#gradient-top-inner-right)', opacity: 0.9 },
    
    // Middle-Center Facet
    { points: '0,-15 -25,-35 -55,15 0,35', fill: 'url(#gradient-mid-center-left)', opacity: 0.9 },
    { points: '0,-15 0,35 55,15 25,-35', fill: 'url(#gradient-mid-center-right)', opacity: 0.85 },
    
    // Bottom-Center Left Facet
    { points: '0,35 -55,15 0,95', fill: 'url(#gradient-bottom-left)', opacity: 0.9 },
    // Bottom-Center Right Facet
    { points: '0,35 0,95 55,15', fill: 'url(#gradient-bottom-right)', opacity: 0.8 },
  ];

  // Determine state indicator labels
  const getStatusOverlayText = () => {
    switch (scanState) {
      case 'scanning': return 'ESCANEANDO...';
      case 'cleaning': return 'DEPURANDO...';
      case 'cleaned': return 'OPTIMIZADO!';
      case 'scanned': return `${(100 - healthPercent).toFixed(0)}% JUNK`;
      default: return 'TACTO PARA SCAN';
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center select-none w-full max-w-[340px] aspect-square mx-auto cursor-grab active:cursor-grabbing"
      ref={containerRef}
      id="crystal-container-wrapper"
    >
      {/* Background Refraction Aura */}
      <motion.div
        className="absolute inset-0 rounded-full blur-[80px] pointer-events-none"
        id="crystal-background-glow-aura"
        animate={{
          backgroundColor: scanState === 'cleaning' 
            ? 'rgba(255, 255, 255, 0.4)' 
            : scanState === 'scanning' 
            ? `${palette.coreGlow}`
            : clutterBlend > 0.6 
            ? 'rgba(239, 68, 68, 0.15)' 
            : `${palette.coreGlow}`,
          scale: isHovered ? 1.15 : 1.0,
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          boxShadow: `${baseGlowShadow} ${
            scanState === 'cleaning' 
              ? '#ffffff' 
              : clutterBlend > 0.6 
              ? '#ef4444' 
              : palette.primary
          }`,
        }}
      />

      {/* Floating Simulated Clutter Dust (Only visible when cluttered/dirty) */}
      {clutterBlend > 0.1 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" id="dust-particles-container">
          {[...Array(Math.floor(clutterBlend * 14) + 4)].map((_, i) => (
            <motion.div
              key={`dust-${i}`}
              className={`absolute rounded-full ${
                clutterBlend > 0.6 ? 'bg-red-400/50' : 'bg-amber-400/40'
              }`}
              style={{
                width: Math.random() * 5 + 3,
                height: Math.random() * 5 + 3,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
              animate={scanState === 'cleaning' ? {
                scale: 0,
                x: 0,
                y: 0,
                opacity: 0,
                transition: { duration: 0.6, delay: i * 0.03 }
              } : {
                y: [0, Math.random() * -30 - 10, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 4 + 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Interactive Drag-to-Rotate Crystal Stage */}
      <motion.div
        drag
        dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
        dragElastic={0.08}
        dragTransition={{ bounceStiffness: 150, bounceDamping: 18 }}
        onDrag={(e, info) => {
          rotateY.set(info.offset.x * 0.4);
          rotateX.set(-info.offset.y * 0.4);
        }}
        onDragEnd={handleDragEnd}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => {
          if (onInteractiveClick && scanState === 'idle') {
            onInteractiveClick();
          }
        }}
        style={{
          rotateX: rX,
          rotateY: rY,
          transformStyle: 'preserve-3d',
          perspective: 800,
        }}
        animate={scanState === 'cleaning' ? {
          scale: [1, 1.25, 0.9, 1.05, 1],
          rotate: [0, 15, -15, 5, 0],
        } : scanState === 'scanning' ? {
          scale: [1, 1.04, 0.98, 1],
        } : {
          scale: isHovered ? 1.05 : 1,
        }}
        transition={scanState === 'cleaning' ? {
          duration: 1.8,
          ease: 'easeInOut',
        } : scanState === 'scanning' ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        className="relative w-full max-w-[260px] aspect-square flex items-center justify-center z-10 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)]"
        id="crystal-interactive-mesh"
      >
        {/* The Crystal SVG Vector Graphic */}
        <motion.svg
          viewBox="-100 -110 200 220"
          className="w-full h-full"
          animate={scanState === 'cleaning' ? {} : {
            rotateY: [0, 360],
          }}
          transition={scanState === 'cleaning' ? {} : {
            repeat: Infinity,
            duration: rotDuration,
            ease: 'linear',
          }}
        >
          {/* Custom Definitions for Gradients and Holographic Filters */}
          <defs>
            {/* Dynamic Interactive Light source position */}
            <radialGradient id="crystal-specular" cx={lightX} cy={lightY} r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="35%" stopColor={palette.secondary} stopOpacity="0.45" />
              <stop offset="80%" stopColor={crystalCoreColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
            </radialGradient>

            {/* Individual Facet Gradients */}
            <linearGradient id="gradient-top-center" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.95" />
              <stop offset="50%" stopColor={crystalCoreColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={palette.accent} stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="gradient-top-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="30%" stopColor={palette.secondary} stopOpacity="0.7" />
              <stop offset="100%" stopColor={palette.accent} stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="gradient-top-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.85" />
              <stop offset="60%" stopColor={crystalCoreColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="gradient-top-inner-right" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="40%" stopColor={palette.secondary} stopOpacity="0.75" />
              <stop offset="100%" stopColor={palette.accent} stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="gradient-mid-center-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.9" />
              <stop offset="50%" stopColor={crystalCoreColor} stopOpacity="0.7" />
              <stop offset="100%" stopColor="#050510" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="gradient-mid-center-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.85" />
              <stop offset="40%" stopColor={crystalCoreColor} stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="gradient-bottom-left" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={palette.accent} stopOpacity="0.95" />
              <stop offset="50%" stopColor={crystalCoreColor} stopOpacity="0.75" />
              <stop offset="100%" stopColor={palette.secondary} stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="gradient-bottom-right" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
              <stop offset="50%" stopColor={palette.accent} stopOpacity="0.75" />
              <stop offset="100%" stopColor={palette.secondary} stopOpacity="0.4" />
            </linearGradient>

            {/* Sweep laser line for scan simulation */}
            <linearGradient id="scan-laser" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Crystal structure clip path for laser scanner constraint */}
            <clipPath id="crystal-clip">
              <polygon points="0,-95 -65,-35 -55,15 0,95 55,15 65,-35" />
            </clipPath>
          </defs>

          {/* Ambient Inner Core Glow */}
          <circle cx="0" cy="0" r="55" fill={`url(#crystal-specular)`} className="opacity-80" />

          {/* Facets mesh */}
          {facets.map((facet, index) => (
            <polygon
              key={`facet-${index}`}
              points={facet.points}
              fill={facet.fill}
              opacity={facet.opacity}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="0.7"
              className="transition-all duration-700"
            />
          ))}

          {/* Holographic light leaks (Prismatic glare cuts) */}
          <polygon
            points="0,-95 25,-35 0,-15"
            fill="rgba(255,255,255,0.15)"
            style={{ mixBlendMode: 'overlay' }}
          />
          <polygon
            points="-25,-35 -65,-35 0,-95"
            fill="rgba(255,255,255,0.08)"
            style={{ mixBlendMode: 'color-dodge' }}
          />

          {/* Glowing laser scanning horizontal sweep bar */}
          {scanState === 'scanning' && (
            <g clipPath="url(#crystal-clip)">
              <motion.rect
                x="-100"
                width="200"
                height="15"
                fill="url(#scan-laser)"
                style={{ mixBlendMode: 'screen' }}
                animate={{
                  y: [-95, 95, -95],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Scan particle lines */}
              <motion.line
                x1="-65"
                y1="0"
                x2="65"
                y2="0"
                stroke={palette.secondary}
                strokeWidth="1.5"
                animate={{
                  y: [-95, 95, -95],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="blur-[1px]"
              />
            </g>
          )}

          {/* Purging Purification Ray (Shockwave burst) */}
          {scanState === 'cleaning' && (
            <motion.circle
              cx="0"
              cy="0"
              r="10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              style={{ mixBlendMode: 'screen' }}
              animate={{
                r: [10, 115],
                opacity: [1, 0],
                strokeWidth: [5, 0.5],
              }}
              transition={{
                duration: 1.2,
                ease: 'easeOut',
              }}
            />
          )}
        </motion.svg>
      </motion.div>

      {/* Embedded High-contrast Glassmorphic Status Pill */}
      <div 
        className="mt-6 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md bg-neutral-900/80 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2"
        id="crystal-status-pill"
      >
        <span 
          className="w-2.5 h-2.5 rounded-full" 
          style={{
            backgroundColor: scanState === 'cleaning' 
              ? '#ffffff' 
              : scanState === 'scanning' 
              ? palette.primary 
              : clutterBlend > 0.6 
              ? '#ef4444' 
              : clutterBlend > 0.2 
              ? '#fbbf24' 
              : palette.primary,
            boxShadow: `0 0 8px ${
              scanState === 'cleaning' 
                ? '#ffffff' 
                : clutterBlend > 0.6 
                ? '#ef4444' 
                : palette.primary
            }`
          }}
        />
        <span className="font-mono text-xs tracking-widest text-neutral-300">
          {getStatusOverlayText()}
        </span>
      </div>

      {/* Subtle interaction tip */}
      {scanState === 'idle' && (
        <span className="text-[10px] text-neutral-500 font-sans mt-2 tracking-wide text-center uppercase">
          Arrastra para girar • Toca para escanear
        </span>
      )}
    </div>
  );
}
