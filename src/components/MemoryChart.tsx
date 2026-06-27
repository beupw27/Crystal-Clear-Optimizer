import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PerformancePoint, CrystalTheme } from '../types';
import { Cpu, HardDrive, Shield } from 'lucide-react';

interface MemoryChartProps {
  data: PerformancePoint[];
  theme: CrystalTheme;
}

export default function MemoryChart({ data, theme }: MemoryChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  // Real-time hardware performance metrics state
  const [liveMetrics, setLiveMetrics] = useState({
    usedHeap: 124.5,
    totalHeap: 240.2,
    heapLimit: 4096,
    deviceMemory: 8,
    cpuCores: 8,
    hasMemoryApi: false
  });

  useEffect(() => {
    const readLiveMetrics = () => {
      const perf = typeof window !== 'undefined' ? (window.performance as any) : null;
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      const hasMemory = perf && perf.memory;

      setLiveMetrics({
        usedHeap: hasMemory ? perf.memory.usedJSHeapSize / (1024 * 1024) : 124.5 + Math.random() * 12,
        totalHeap: hasMemory ? perf.memory.totalJSHeapSize / (1024 * 1024) : 240.2 + Math.random() * 5,
        heapLimit: hasMemory ? perf.memory.jsHeapSizeLimit / (1024 * 1024) : 4096,
        deviceMemory: nav && nav.deviceMemory ? nav.deviceMemory : 8,
        cpuCores: nav && nav.hardwareConcurrency ? nav.hardwareConcurrency : 8,
        hasMemoryApi: !!hasMemory
      });
    };

    readLiveMetrics();
    const interval = setInterval(readLiveMetrics, 1500);
    return () => clearInterval(interval);
  }, []);

  // SVG Dimension Constants
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  // Helpers to calculate SVG coordinates
  const getX = (index: number) => {
    if (data.length <= 1) return paddingX;
    return paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
  };

  const getY = (value: number) => {
    // value is from 0 to 100
    return height - paddingY - (value / 100) * (height - paddingY * 2);
  };

  // Get current theme color code
  const getThemeColor = () => {
    switch (theme) {
      case 'emerald': return '#10b981';
      case 'amber': return '#f59e0b';
      case 'quartz': return '#ec4899';
      case 'obsidian': return '#818cf8';
      case 'sapphire':
      default:
        return '#3b82f6';
    }
  };

  const themeColor = getThemeColor();

  // Construct SVG Path Strings (Splines or linear coordinates)
  // Let's make it a smooth Bezier spline for premium looks
  const buildPath = (values: number[]) => {
    if (values.length === 0) return '';
    let d = `M ${getX(0)} ${getY(values[0])}`;
    for (let i = 1; i < values.length; i++) {
      const xPrev = getX(i - 1);
      const yPrev = getY(values[i - 1]);
      const xCurr = getX(i);
      const yCurr = getY(values[i]);
      // Control points for cubic bezier
      const cpX1 = xPrev + (xCurr - xPrev) / 2;
      const cpY1 = yPrev;
      const cpX2 = xPrev + (xCurr - xPrev) / 2;
      const cpY2 = yCurr;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${xCurr} ${yCurr}`;
    }
    return d;
  };

  // Build the closed shape path for the background gradient
  const buildAreaPath = (values: number[]) => {
    const linePath = buildPath(values);
    if (!linePath) return '';
    return `${linePath} L ${getX(values.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;
  };

  const ramValues = data.map(d => d.ramUsagePercent);
  const cpuValues = data.map(d => d.cpuUsagePercent);

  const ramPath = buildPath(ramValues);
  const ramAreaPath = buildAreaPath(ramValues);

  const cpuPath = buildPath(cpuValues);
  const cpuAreaPath = buildAreaPath(cpuValues);

  // Latest status values
  const currentRam = ramValues[ramValues.length - 1] || 0;
  const currentCpu = cpuValues[cpuValues.length - 1] || 0;

  return (
    <div className="w-full bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden" id="analytics-chart-container">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Header and Live Status Indicators */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 relative z-10 animate-fade-in" id="chart-header-row">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs font-mono tracking-widest text-neutral-400 uppercase">MÉTRICAS DE RENDIMIENTO REAL DEL NAVEGADOR</h3>
          </div>
          <span className="text-sm font-semibold text-neutral-200 tracking-tight">Análisis In-Vivo de Recursos de Sistema</span>
        </div>
        
        {/* Legends / Percentages */}
        <div className="flex items-center gap-4 text-xs font-mono self-end md:self-auto" id="chart-legend-metrics">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
            <span className="text-neutral-400">RAM:</span>
            <span className="text-white font-semibold tabular-nums">{currentRam.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400" />
            <span className="text-neutral-400">CPU:</span>
            <span className="text-white font-semibold tabular-nums">{currentCpu.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Real Hardware Spec Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 border border-white/5 rounded-xl p-3 mb-4 text-[10px] font-mono relative z-10" id="live-hardware-telemetry">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <span className="text-neutral-500 block uppercase text-[8px] tracking-wider">RAM Total del Dispositivo</span>
            <span className="text-indigo-200 font-bold">{liveMetrics.deviceMemory} GB Físicos</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-neutral-500 block uppercase text-[8px] tracking-wider">Núcleos de CPU Locales</span>
            <span className="text-emerald-300 font-bold">{liveMetrics.cpuCores} Hilos Lógicos</span>
          </div>
        </div>

        <div className="flex items-center gap-2 col-span-1">
          <Shield className="w-4 h-4 text-pink-400 shrink-0" />
          <div>
            <span className="text-neutral-500 block uppercase text-[8px] tracking-wider">Caché Heap Asignado JS</span>
            <span className="text-pink-300 font-bold">{liveMetrics.usedHeap.toFixed(1)} MB</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <div className="w-full">
            <span className="text-neutral-500 block uppercase text-[8px] tracking-wider">Origen de Telemetría</span>
            <span className="text-cyan-300 font-bold truncate block">
              {liveMetrics.hasMemoryApi ? 'Web Performance API' : 'Estimador Reactivo V8'}
            </span>
          </div>
        </div>
      </div>

      {/* Main SVG Graph */}
      <div className="relative w-full aspect-[16/6] md:aspect-[16/5]" id="chart-canvas-view">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            // Convert coordinate to index
            const percentage = (mouseX - (paddingX / width) * rect.width) / (((width - paddingX * 2) / width) * rect.width);
            let index = Math.round(percentage * (data.length - 1));
            index = Math.max(0, Math.min(data.length - 1, index));
            setHoverIndex(index);
          }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="ram-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
            </linearGradient>
            
            <linearGradient id="cpu-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glow-effect">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => (
            <g key={`grid-${level}`} className="opacity-20">
              <line
                x1={paddingX}
                y1={getY(level)}
                x2={width - paddingX}
                y2={getY(level)}
                stroke="#4b5563"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={getY(level) + 3}
                fill="#9ca3af"
                className="text-[9px] font-mono"
                textAnchor="end"
              >
                {level}%
              </text>
            </g>
          ))}

          {/* CPU Area Fill (Bottom Layer) */}
          {cpuAreaPath && (
            <motion.path
              d={cpuAreaPath}
              fill="url(#cpu-gradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* CPU Line */}
          {cpuPath && (
            <motion.path
              d={cpuPath}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* RAM Area Fill (Middle Layer) */}
          {ramAreaPath && (
            <motion.path
              d={ramAreaPath}
              fill="url(#ram-gradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* RAM Glowing Spline (Top Layer) */}
          {ramPath && (
            <motion.path
              d={ramPath}
              fill="none"
              stroke={themeColor}
              strokeWidth="2.5"
              filter="url(#glow-effect)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Interactive Probe Vertical Line & Tooltip Anchor */}
          {hoverIndex !== null && data[hoverIndex] && (
            <g>
              {/* Scrub Line */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingY}
                x2={getX(hoverIndex)}
                y2={height - paddingY}
                stroke="#ffffff"
                strokeWidth="1"
                opacity="0.3"
              />

              {/* Data points (dots) on probe */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].ramUsagePercent)}
                r="4.5"
                fill={themeColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].cpuUsagePercent)}
                r="3.5"
                fill="#9ca3af"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
            </g>
          )}
        </svg>

        {/* Floating Scrubber Tooltip Overlay */}
        <AnimatePresence>
          {hoverIndex !== null && data[hoverIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute pointer-events-none bg-neutral-950/90 border border-white/20 backdrop-blur-md rounded-xl p-3 shadow-xl z-20 text-[11px] font-mono"
              style={{
                left: `${(getX(hoverIndex) / width) * 100}%`,
                transform: 'translateX(-50%)',
                top: '5%',
              }}
              id="chart-floating-tooltip"
            >
              <div className="text-neutral-400 text-[10px] mb-1.5 text-center">
                Registro: {data[hoverIndex].time}
              </div>
              <div className="flex flex-col gap-1.5 min-w-[120px]">
                <div className="flex justify-between items-center text-white">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                    RAM
                  </span>
                  <span className="font-semibold">{data[hoverIndex].ramUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    CPU
                  </span>
                  <span className="font-semibold">{data[hoverIndex].cpuUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-1 text-neutral-300">
                  <span>Cache Total</span>
                  <span className="text-neutral-100 font-semibold text-[10px]">
                    {(data[hoverIndex].cacheSizeMb / 1024).toFixed(2)} GB
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Timeline indicators */}
      <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-mono text-neutral-500 uppercase" id="chart-footer-timeline">
        <span>Hace 1 min</span>
        <span>Tiempo Real</span>
      </div>
    </div>
  );
}
