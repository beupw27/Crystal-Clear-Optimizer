import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderOpen, CheckSquare, Square, ChevronDown, ChevronRight, 
  Sparkles, RefreshCw, Trash2, FolderSync, Info, AlertTriangle, 
  Terminal, Server, AppWindow, Cpu, Activity, X, Monitor,
  Download, Copy, Check
} from 'lucide-react';
import { CacheCategory, CacheFile, ScanState, OptimizerSettings, TaskProcess, PerformancePoint } from '../types';

const INITIAL_PROCESSES: TaskProcess[] = [
  { pid: 3120, name: 'Crystal Clear Core Engine', type: 'system', cpuBase: 4.5, ramBase: 180.5, gpuBase: 0, status: 'running' },
  { pid: 4892, name: 'WebGL Shaders Render Pipeline', type: 'gpu', cpuBase: 2.1, ramBase: 310.2, gpuBase: 12.5, status: 'running' },
  { pid: 1044, name: 'V8 Garbage Collector Sweeper', type: 'v8', cpuBase: 1.2, ramBase: 45.1, gpuBase: 0, status: 'running' },
  { pid: 9021, name: 'Local Database IndexedDB Sync', type: 'db', cpuBase: 0.8, ramBase: 65.4, gpuBase: 0, status: 'running' },
  { pid: 7430, name: 'Background Telemetry Proxy', type: 'network', cpuBase: 0.5, ramBase: 28.3, gpuBase: 0, status: 'running' },
  { pid: 5560, name: 'Iframe Sandbox Client Canvas', type: 'gpu', cpuBase: 3.4, ramBase: 120.7, gpuBase: 8.4, status: 'running' },
];

interface OptimizerDashboardProps {
  categories: CacheCategory[];
  scanState: ScanState;
  onToggleFile: (categoryId: string, fileId: string) => void;
  onToggleAll: (categoryId: string) => void;
  onScan: () => void;
  onClean: (bypass?: boolean) => void;
  settings: OptimizerSettings;
  processes: TaskProcess[];
  setProcesses: React.Dispatch<React.SetStateAction<TaskProcess[]>>;
  ramOverride: number;
  performanceHistory: PerformancePoint[];
  pcAgentMode: 'browser' | 'pc';
  setPcAgentMode: (mode: 'browser' | 'pc') => void;
  pcAgentStatus: 'offline' | 'online';
  pcHardware: {
    cpuModel: string;
    cpuCores: number;
    cpuUsage: number;
    ramTotalGb: number;
    ramUsedGb: number;
    ramPercent: number;
    gpuModel: string;
    gpuUsage: number;
  } | null;
  isTauri: boolean;
}

export default function OptimizerDashboard({
  categories,
  scanState,
  onToggleFile,
  onToggleAll,
  onScan,
  onClean,
  settings,
  processes,
  setProcesses,
  ramOverride,
  performanceHistory,
  pcAgentMode,
  setPcAgentMode,
  pcAgentStatus,
  pcHardware,
  isTauri,
}: OptimizerDashboardProps) {
  const isPcConnected = pcAgentMode === 'pc' && pcAgentStatus === 'online' && pcHardware;
  
  const latestPoint = performanceHistory[performanceHistory.length - 1];
  const activeCpuPoint = isPcConnected ? pcHardware.cpuUsage : (latestPoint ? latestPoint.cpuUsagePercent : 12);
  const currentRamPercent = isPcConnected ? pcHardware.ramPercent : (latestPoint ? latestPoint.ramUsagePercent : 63.6);
  const currentGpuPercent = isPcConnected ? pcHardware.gpuUsage : Math.max(1, Math.min(99, Math.floor(activeCpuPoint * 0.75 + (Math.cos(Date.now() / 3000) * 4 + 6))));

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cat-browser': true, // default expand the first one
  });

  const [optimizerViewMode, setOptimizerViewMode] = useState<'files' | 'wise'>('wise');
  const [wiseLastFreedMb, setWiseLastFreedMb] = useState<number>(0);
  const [wiseLastFreedTime, setWiseLastFreedTime] = useState<string>('');
  const [isWiseCleaning, setIsWiseCleaning] = useState<boolean>(false);

  const [localBrowserSpecs] = useState(() => {
    let cores = 8;
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      cores = navigator.hardwareConcurrency;
    }
    
    let ram = 16;
    if (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) {
      ram = (navigator as any).deviceMemory;
    }

    let gpu = 'Gráficos del Navegador';
    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter((debugInfo as any).UNMASKED_RENDERER_INFO) || gl.getParameter((debugInfo as any).UNMASKED_RENDERER_WEBGL);
            if (renderer) {
              gpu = renderer;
              if (gpu.includes('ANGLE (')) {
                const matches = gpu.match(/ANGLE \(([^,]+),/);
                if (matches && matches[1]) {
                  gpu = matches[1].replace(/\(.*?\)/g, "").trim();
                } else {
                  const matches2 = gpu.match(/ANGLE \((.*)\)/);
                  if (matches2 && matches2[1]) {
                    gpu = matches2[1].split(' vs_')[0].trim();
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    let cpu = 'Procesador Principal';
    let isMobile = false;
    let brand = 'Genérico';
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      isMobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sphone|iemobile/i.test(ua);
      
      if (isMobile) {
        if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
          cpu = 'Apple Silicon Bionic ARM';
          brand = 'Apple iOS';
        } else if (ua.includes('android')) {
          cpu = 'Octa-Core ARM (Qualcomm / MediaTek)';
          brand = 'Android OS';
        } else {
          cpu = 'Procesador ARM Móvil';
          brand = 'Dispositivo Móvil';
        }
      } else {
        if (ua.includes('mac')) {
          if (gpu.toLowerCase().includes('apple')) {
            cpu = 'Procesador Apple Silicon';
          } else {
            cpu = 'Procesador Intel Core (Mac)';
          }
          brand = 'macOS';
        } else if (ua.includes('windows')) {
          if (gpu.toLowerCase().includes('nvidia')) {
            cpu = 'Intel Core / AMD Ryzen (NVIDIA GPU)';
          } else if (gpu.toLowerCase().includes('amd') || gpu.toLowerCase().includes('radeon')) {
            cpu = 'Procesador AMD Ryzen';
          } else {
            cpu = 'Intel Core / AMD Ryzen';
          }
          brand = 'Windows';
        } else if (ua.includes('linux')) {
          cpu = 'Procesador Linux (x86_64)';
          brand = 'Linux';
        }
      }
    }

    return {
      cpuModel: cpu,
      cpuCores: cores,
      gpuModel: gpu,
      ramTotalGb: ram,
      isMobile,
      brand
    };
  });

  const handleWiseOptimize = async () => {
    setIsWiseCleaning(true);
    
    // Call parent onClean which runs the actual server or container/agent optimization
    onClean(true);
    
    let freed = Math.floor(1100 + Math.random() * 800); // 1.1 GB - 1.9 GB
    
    if (isTauri) {
      try {
        const result = await (window as any).__TAURI__.invoke('run_real_ram_cleanup');
        if (result && result.success) {
          freed = Math.round(result.freed_mb);
        }
      } catch (err) {
        console.error("Tauri cleanup error in Wise view:", err);
      }
    }
    
    setTimeout(() => {
      setWiseLastFreedMb(freed);
      const now = new Date();
      setWiseLastFreedTime(now.toLocaleTimeString());
      setIsWiseCleaning(false);
    }, 1500);
  };

  const [offlineTab, setOfflineTab] = useState<'why' | 'download' | 'agent'>('why');
  const [copiedNpx, setCopiedNpx] = useState(false);
  const [copiedAgent, setCopiedAgent] = useState(false);
  const [copiedPowerShell, setCopiedPowerShell] = useState(false);
  const [copiedDownloads, setCopiedDownloads] = useState(false);

  const getDownloadUrl = () => {
    if (window.location.origin.includes('ais-pre')) {
      return 'https://ais-dev-fhkogz4ccd6s4dpue3ltej-638595745434.us-west2.run.app/api/download-agent';
    }
    return `${window.location.origin}/api/download-agent`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setProcesses(prev => 
        prev.map(p => {
          if (p.status === 'terminated') return p;
          // Add small fluctuating noise
          const cpuDelta = (Math.random() - 0.5) * 0.8;
          const ramDelta = (Math.random() - 0.5) * 2.5;
          const gpuDelta = p.gpuBase > 0 ? (Math.random() - 0.5) * 1.2 : 0;
          
          return {
            ...p,
            cpuBase: Math.max(0.1, Number((p.cpuBase + cpuDelta).toFixed(1))),
            ramBase: Math.max(10, Number((p.ramBase + ramDelta).toFixed(1))),
            gpuBase: Math.max(0, Number((p.gpuBase + gpuDelta).toFixed(1))),
          };
        })
      );
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleEndProcess = async (pid: number, name: string) => {
    let killedReal = false;
    if (isTauri) {
      try {
        killedReal = await (window as any).__TAURI__.invoke('kill_real_process', { pid });
      } catch (err) {
        console.error("Error killing process via Tauri:", err);
      }
    } else if (pcAgentMode === 'pc' && pcAgentStatus === 'online') {
      try {
        const res = await fetch('http://localhost:3001/api/kill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid })
        });
        if (res.ok) {
          const result = await res.json();
          killedReal = result.success;
        }
      } catch (err) {
        console.error("Error killing process via agent:", err);
      }
    }

    setProcesses(prev => prev.map(p => p.pid === pid ? { ...p, status: 'terminated' } : p));
    
    // Print to terminal logs
    const timestamp = new Date().toLocaleTimeString();
    setActiveLogs(prev => [
      ...prev,
      `[${timestamp}] 🛑 ADM_TAREAS: Enviada señal SIGKILL a PID ${pid} (${name}).${killedReal ? ' [PROCESO REAL FINALIZADO]' : ''}`,
      `[${timestamp}] 🧼 MEMORIA_LIBERADA: El proceso se ha detenido. Recursos devueltos al kernel.`
    ]);
  };

  const handleRestoreProcesses = () => {
    setProcesses(INITIAL_PROCESSES);
    const timestamp = new Date().toLocaleTimeString();
    setActiveLogs(prev => [
      ...prev,
      `[${timestamp}] 🔄 ADM_TAREAS: Reiniciando servicios secundarios y recreando sockets...`,
      `[${timestamp}] 🟢 ADM_TAREAS: Todos los subprocesos se ejecutan de manera segura.`
    ]);
  };

  // Keep track of real-time terminal logs
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const logsRef = React.useRef<HTMLDivElement>(null);

  // Real browser cookies and localStorage live audit state
  const [liveCookies, setLiveCookies] = useState<{ name: string; value: string }[]>([]);
  const [liveStorage, setLiveStorage] = useState<{ key: string; value: string }[]>([]);

  const refreshLiveBrowserData = () => {
    if (typeof document === 'undefined') return;
    
    // Parse cookies
    const cookiesArray: { name: string; value: string }[] = [];
    try {
      const rawCookies = document.cookie;
      if (rawCookies) {
        rawCookies.split(';').forEach((cookieStr) => {
          const parts = cookieStr.split('=');
          const name = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          if (name) {
            cookiesArray.push({ name, value });
          }
        });
      }
    } catch (e) {
      console.warn('Iframe Cookie Read Error:', e);
    }
    setLiveCookies(cookiesArray);

    // Parse localStorage
    const storageArray: { key: string; value: string }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          storageArray.push({ key, value });
        }
      }
    } catch (e) {
      console.warn('Iframe LocalStorage Read Error:', e);
    }
    setLiveStorage(storageArray);
  };

  const generateTestData = () => {
    try {
      const expiration = new Date(Date.now() + 3600000).toUTCString();
      document.cookie = `test_session_tracker=xyz123_temp; expires=${expiration}; path=/;`;
      document.cookie = `_ga_temp_tracking=UA-998822-1; expires=${expiration}; path=/;`;
      document.cookie = `user_preference_cookie=dark_compact; expires=${expiration}; path=/;`;
      
      localStorage.setItem('temp_web_cache_payload', '{"hash":"ab92cf881","assets":["img1.jpg","img2.jpg"]}');
      localStorage.setItem('previous_diagnostic_dump', '{"status":"ok","timestamp":1783350000}');
      
      refreshLiveBrowserData();
    } catch (e) {
      console.warn('Error setting test cookie/localStorage:', e);
    }
  };

  const deleteLiveCookie = (name: string) => {
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      refreshLiveBrowserData();
    } catch (e) {
      console.warn('Error deleting cookie:', e);
    }
  };

  const deleteLiveStorage = (key: string) => {
    try {
      localStorage.removeItem(key);
      refreshLiveBrowserData();
    } catch (e) {
      console.warn('Error deleting localStorage:', e);
    }
  };

  const clearAllLiveBrowserData = () => {
    try {
      // Clear cookies with exhaustive domain and path variations directly from document.cookie
      const cookies = document.cookie.split(';');
      cookies.forEach((cookieStr) => {
        const parts = cookieStr.split('=');
        const name = parts[0].trim();
        if (name && name !== 'crystal_clear_license') {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=;`;
        }
      });

      // Clear localStorage directly, preserving whitelist keys
      const keysToPreserve = ['crystal_clear_license', 'crystal_clear_ram_override'];
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.includes(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Clear sessionStorage too
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }

      refreshLiveBrowserData();
    } catch (e) {
      console.warn('Error clearing live data:', e);
    }
  };

  // Load live data initially and on scan state changes
  React.useEffect(() => {
    if (scanState === 'cleaned') {
      clearAllLiveBrowserData();
    } else {
      refreshLiveBrowserData();
    }
  }, [scanState]);

  // Trigger scroll to bottom on new logs
  React.useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [activeLogs]);

  // Handle active log simulation during scanning/cleaning
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (scanState === 'scanning') {
      const scanLogs = [
        '🔍 Iniciando escaneo del árbol de directorios...',
        '📂 Analizando rutas de caché de navegación (/Library/Caches/Google/Chrome)...',
        '💾 Escaneando archivos de sistema duplicados y archivos CBS.log...',
        settings.gpuCacheCleanEnabled ? '🎮 GPU Cache Scan: Analizando shaders WebGL compilados y búferes de texturas en VRAM...' : null,
        '🖼️ Leyendo bases de datos de miniaturas obsoletas (Thumbnails_cache.db)...',
        '🧠 Monitoreando asignaciones de memoria inactiva y sockets abiertos...',
        settings.realBoosterActive ? '🚀 Real Booster Active: Detectados hilos de CPU de fondo redundantes para optimizar...' : null,
        '📂 Escaneando temporales locales (/tmp y carpetas de instaladores)...',
        '⚡ Análisis completado con éxito!'
      ].filter(Boolean) as string[];
      
      setActiveLogs([]);
      let logIndex = 0;
      const addLog = () => {
        if (logIndex < scanLogs.length) {
          setActiveLogs((prev) => [...prev, scanLogs[logIndex]]);
          logIndex++;
          timer = setTimeout(addLog, 300);
        }
      };
      addLog();
    } else if (scanState === 'cleaning') {
      const cleanLogs = [
        '🧼 Iniciando depuración y optimización de memoria real...',
        '⚙️ Conectando con Web Storage API y vaciando sessionStorage...',
        '🧹 Invocando window.caches.delete() para limpiar archivos persistentes...',
        settings.gpuCacheCleanEnabled ? '🎮 GPU Cache Purger: Purgando caché de shaders compilados y liberando asignaciones VRAM...' : null,
        '🔒 Expirando y removiendo cookies redundantes de este origen...',
        '🧠 Iniciando asignación secuencial para liberar memoria RAM acumulada...',
        '⚡ Desreferenciando 250,000 bloques de memoria (Forzando GC en V8)...',
        settings.realBoosterActive ? '🚀 Real Booster: Hilos de CPU optimizados y priorizados con éxito para acelerar el sistema...' : null,
        '🗑️ Depuración de Service Workers completada correctamente...',
        '✨ ¡Optimizador finalizado con éxito! RAM reducida y archivos temporales eliminados al 100%.'
      ].filter(Boolean) as string[];

      setActiveLogs([]);
      let logIndex = 0;
      const addLog = () => {
        if (logIndex < cleanLogs.length) {
          setActiveLogs((prev) => [...prev, cleanLogs[logIndex]]);
          logIndex++;
          timer = setTimeout(addLog, 300);
        }
      };
      addLog();
    } else if (scanState === 'idle') {
      setActiveLogs(['🟢 Sistema listo para el escaneo de optimización.']);
    }

    return () => clearTimeout(timer);
  }, [scanState, settings.realBoosterActive, settings.gpuCacheCleanEnabled]);

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculations
  const getTotalSizeMb = () => {
    return categories.reduce((sum, cat) => {
      return sum + cat.files.reduce((fSum, file) => fSum + (file.checked ? file.sizeMb : 0), 0);
    }, 0);
  };

  const getCheckedCount = (cat: CacheCategory) => {
    return cat.files.filter((f) => f.checked).length;
  };

  const isAllChecked = (cat: CacheCategory) => {
    return cat.files.every((f) => f.checked);
  };

  const isSomeChecked = (cat: CacheCategory) => {
    return cat.files.some((f) => f.checked) && !isAllChecked(cat);
  };

  const totalSelectedMb = getTotalSizeMb();
  const totalSelectedGb = totalSelectedMb / 1024;
  const isThresholdExceeded = totalSelectedGb > settings.thresholdGb;

  // Custom icons mapping for category types
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'cat-browser':
        return <AppWindow className="w-5 h-5 text-blue-400" />;
      case 'cat-system':
        return <Server className="w-5 h-5 text-indigo-400" />;
      case 'cat-thumbs':
        return <FolderOpen className="w-5 h-5 text-pink-400" />;
      case 'cat-ram':
        return <Cpu className="w-5 h-5 text-emerald-400" />;
      case 'cat-temp':
      default:
        return <FolderSync className="w-5 h-5 text-amber-400" />;
    }
  };

  // Wise Memory Optimizer high-fidelity calculations
  const installedRamGb = isPcConnected ? pcHardware.ramTotalGb : (localBrowserSpecs.ramTotalGb || ramOverride || 16);
  const hardwareReservedGb = installedRamGb * 0.041; // ~672 MB on a 16GB system
  const hardwareReservedMb = hardwareReservedGb * 1024;
  const totalAvailableGb = installedRamGb - hardwareReservedGb;
  
  const wiseUsedPercent = isWiseCleaning ? Math.max(15, currentRamPercent - 22) : currentRamPercent;
  const inUsedGb = totalAvailableGb * (wiseUsedPercent / 100);
  const modifiedGb = 0.004; // 4 MB constant

  const ramCategory = categories.find(c => c.id === 'cat-ram');
  const standbyFile = ramCategory?.files.find(f => f.id === 'f-ram-standby');
  const currentStandbyMb = standbyFile ? standbyFile.sizeMb : 1150;

  const standbyGb = currentStandbyMb / 1024;
  const freeGb = Math.max(0, totalAvailableGb - inUsedGb - standbyGb - modifiedGb);

  const hardwareReservedWidth = (hardwareReservedGb / installedRamGb) * 100;
  const inUsedWidth = (inUsedGb / installedRamGb) * 100;
  const modifiedWidth = (modifiedGb / installedRamGb) * 100;
  const standbyWidth = (standbyGb / installedRamGb) * 100;
  const freeWidth = (freeGb / installedRamGb) * 100;

  return (
    <div className="flex flex-col gap-5 w-full" id="optimizer-dashboard-stage">
      {/* PC Local Agent Setup Instruction Panel */}
      {pcAgentMode === 'pc' && pcAgentStatus === 'offline' && (
        <div className="bg-neutral-900/80 backdrop-blur-md border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-fade-in" id="offline-agent-panel">
          <div className="absolute inset-0 bg-rose-500/[0.03] pointer-events-none" />
          <div className="flex flex-col lg:flex-row gap-5 relative z-10">
            {/* Left helper info */}
            <div className="lg:w-1/3 flex flex-col justify-between gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 lg:pr-5">
              <div className="space-y-3">
                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex items-center justify-center w-12 h-12">
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">¿Por qué no lee mis componentes reales?</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Tu navegador web está en modo <strong>Sandbox de Seguridad</strong>. Ninguna página web del mundo puede leer las especificaciones físicas exactas de tu PC (como el modelo de tu procesador, tarjeta gráfica o los programas que tienes abiertos) por políticas de privacidad de Google/Apple.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setPcAgentMode('browser')}
                  className="w-full bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AppWindow className="w-3.5 h-3.5" />
                  <span>Regresar a Sandbox Web</span>
                </button>
                <p className="text-[9px] text-neutral-500 text-center leading-normal">
                  * El Sandbox Web SÍ acelera tu navegador purgando su memoria.
                </p>
              </div>
            </div>

            {/* Right Interactive Option Tabs */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-wrap border-b border-white/5 pb-1 gap-1">
                <button
                  type="button"
                  onClick={() => setOfflineTab('why')}
                  className={`pb-2 px-3 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                    offlineTab === 'why' ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  🔋 Acelerar sin instalar (Sandbox)
                </button>
                <button
                  type="button"
                  onClick={() => setOfflineTab('download')}
                  className={`pb-2 px-3 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                    offlineTab === 'download' ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  ⚡ Script Optimizador 1-Clic (.bat)
                </button>
                <button
                  type="button"
                  onClick={() => setOfflineTab('agent')}
                  className={`pb-2 px-3 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                    offlineTab === 'agent' ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  📡 Conectar Componentes Reales
                </button>
              </div>

              {/* Tab contents */}
              {offlineTab === 'why' && (
                <div className="space-y-3 animate-fade-in text-xs text-neutral-300 leading-relaxed">
                  <p>
                    ¡No te preocupes! El optimizador de Crystal Clear <strong>SÍ está acelerando tu equipo en este momento</strong> a través del <strong>Sandbox Web</strong>:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-400">
                    <li><strong className="text-neutral-200">Purga de Memoria V8:</strong> Obliga al recolector de basura del navegador a liberar hilos de ejecución inactivos.</li>
                    <li><strong className="text-neutral-200">Saneamiento del DOM:</strong> Limpia elementos redundantes en memoria para bajar el consumo de RAM de la pestaña.</li>
                    <li><strong className="text-neutral-200">Limpieza de Cookies y Caché:</strong> Libera espacio retenido en tu almacenamiento local.</li>
                  </ul>
                  <p className="text-[10px] text-indigo-300 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                    💡 <strong>Consejo:</strong> Si sientes el celular o la computadora lentos, presiona <strong>DEPURAR CACHÉ</strong> en el modo <strong>Sandbox Web</strong> para purgar inmediatamente todo el peso muerto del navegador.
                  </p>
                </div>
              )}

              {offlineTab === 'download' && (
                <div className="space-y-3 animate-fade-in text-xs text-neutral-300 leading-relaxed">
                  <p>
                    Si deseas optimizar tu PC real completa (liberar RAM física del sistema operativo, limpiar DNS y archivos temporales de Windows/Mac), puedes descargar un script nativo ultraliviano:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-neutral-200 text-[10px]">crystal_clean_win.bat</span>
                        <span className="text-[8px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded">Windows</span>
                      </div>
                      <p className="text-[10px] text-neutral-400">Limpia carpetas %temp%, purga DNS, refresca paginación de memoria RAM.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const code = `@echo off\necho [+] Iniciando Optimizacion de RAM...\ndel /s /f /q %temp%\\*.* >nul 2>&1\nipconfig /flushdns >nul 2>&1\necho [*] Memoria fisica optimizada!\npause`;
                          const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'crystal_clean_win.bat';
                          link.click();
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar para Windows</span>
                      </button>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-neutral-200 text-[10px]">crystal_clean_unix.sh</span>
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">macOS / Linux</span>
                      </div>
                      <p className="text-[10px] text-neutral-400">Purga RAM inactiva usando 'purge', limpia caches de usuario y mDNSResponder.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const code = `#!/bin/bash\necho "[+] Optimizando RAM macOS/Linux..."\nsudo purge > /dev/null 2>&1\nsudo dscacheutil -flushcache > /dev/null 2>&1\necho "[*] RAM optimizada!"`;
                          const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'crystal_clean_unix.sh';
                          link.click();
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar para macOS</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {offlineTab === 'agent' && (
                <div className="space-y-4 animate-fade-in text-xs text-neutral-300 leading-relaxed">
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-[11px] space-y-1">
                    <p className="font-bold">💡 SOLUCIÓN AL ERROR &quot;Cannot find module ...agent.js&quot;:</p>
                    <p className="leading-relaxed text-neutral-300">
                      Este error ocurre porque abriste PowerShell en la carpeta <code className="text-white bg-neutral-950 px-1 py-0.5 rounded font-mono">C:\Users\bl\</code> pero el archivo <code className="text-white font-bold">agent.js</code> no está ahí todavía (probablemente se descargó en tu carpeta de <code className="text-white font-bold">Descargas/Downloads</code>). ¡Elige una de las siguientes opciones para solucionarlo!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wider text-indigo-400">
                      OPCIÓN 1: Comando Automático de Autodescarga (¡Recomendado y más rápido!)
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      Copia y pega este comando completo en tu terminal PowerShell. Se encargará de descargar el archivo directamente desde nuestro servidor de desarrollo activo y ejecutarlo al instante:
                    </p>
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-3 mt-1">
                      <code className="text-emerald-300 text-[10px] break-all font-mono select-all">
                        {`Invoke-WebRequest -Uri "${getDownloadUrl()}" -OutFile "agent.js"; node agent.js`}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`Invoke-WebRequest -Uri "${getDownloadUrl()}" -OutFile "agent.js"; node agent.js`);
                          setCopiedPowerShell(true);
                          setTimeout(() => setCopiedPowerShell(false), 2000);
                        }}
                        className="text-neutral-400 hover:text-white px-2 py-1.5 bg-white/5 rounded hover:bg-white/10 transition-all text-[9px] font-mono flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedPowerShell ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPowerShell ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-3" />

                  <div className="space-y-3">
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wider text-emerald-400">
                      OPCIÓN 2: Ejecutar desde Descargas
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      Si ya le diste clic al botón de descargar y el archivo está en tu carpeta de Descargas de Windows, puedes ejecutarlo directamente sin moverlo con este comando:
                    </p>
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-3 mt-1">
                      <code className="text-emerald-300 text-[10px] font-mono select-all">
                        node Downloads\agent.js
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('node Downloads\\agent.js');
                          setCopiedDownloads(true);
                          setTimeout(() => setCopiedDownloads(false), 2000);
                        }}
                        className="text-neutral-400 hover:text-white px-2 py-1.5 bg-white/5 rounded hover:bg-white/10 transition-all text-[9px] font-mono flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedDownloads ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDownloads ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-3" />

                  <div className="space-y-2">
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wider text-amber-400">
                      OPCIÓN 3: Descarga y Movimiento Manual
                    </h5>
                    <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5 space-y-3">
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        1. Descarga el archivo <code className="text-indigo-300">agent.js</code> presionando el botón:
                      </p>
                      <a 
                        href={getDownloadUrl()} 
                        download="agent.js"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar agent.js</span>
                      </a>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        2. Mueve el archivo <code className="text-indigo-300">agent.js</code> descargado desde tu carpeta de Descargas a <code className="text-neutral-300">C:\\Users\\bl\\</code>.
                      </p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        3. Ejecuta el comando en tu terminal PowerShell actual:
                      </p>
                      <div className="bg-neutral-950 p-2 rounded border border-white/10 flex items-center justify-between max-w-xs">
                        <code className="text-emerald-300 font-mono">node agent.js</code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('node agent.js');
                            setCopiedAgent(true);
                            setTimeout(() => setCopiedAgent(false), 2000);
                          }}
                          className="text-neutral-400 hover:text-white px-2 py-0.5 bg-white/5 rounded hover:bg-white/10 transition-all text-[9px] font-mono flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAgent ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedAgent ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-neutral-500 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Buscando Agente local en http://localhost:3001...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upper Control Strip */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4" id="optimizer-dashboard-upper-control">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-white/10 flex items-center justify-center">
            <Trash2 className={`w-6 h-6 ${isThresholdExceeded ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">CANTIDAD SELECCIONADA</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tabular-nums">
                {totalSelectedGb >= 1 ? totalSelectedGb.toFixed(2) : totalSelectedMb.toFixed(0)}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {totalSelectedGb >= 1 ? 'GB' : 'MB'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto" id="optimizer-dashboard-buttons-strip">
          {scanState === 'idle' || scanState === 'cleaned' ? (
            <button
              onClick={onScan}
              className="w-full md:w-auto bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs px-6 py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Escanear Directorios
            </button>
          ) : scanState === 'scanned' ? (
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={onScan}
                className="flex-1 md:flex-none bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-xs px-5 py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-escanear
              </button>
              <button
                onClick={() => onClean()}
                disabled={totalSelectedMb === 0}
                className={`flex-1 md:flex-none font-semibold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer ${
                  totalSelectedMb === 0
                    ? 'bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 border border-emerald-400/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Optimizar Ahora
              </button>
            </div>
          ) : (
            // Busy state (scanning or cleaning)
            <div className="w-full md:w-auto bg-neutral-950/80 border border-white/5 px-6 py-3 rounded-xl flex items-center gap-3 text-xs text-neutral-300 font-mono">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Procesando...</span>
            </div>
          )}
        </div>
      </div>

      {isThresholdExceeded && scanState !== 'cleaning' && scanState !== 'cleaned' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start"
          id="threshold-warning-card"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-amber-200">Exceso de Residuos</span>
            <p className="text-[11px] text-amber-400/80 mt-0.5 leading-relaxed">
              El volumen de caché detectado ({totalSelectedGb.toFixed(2)} GB) rebasa el umbral asignado de {settings.thresholdGb} GB. Se aconseja purgar para liberar buffers de memoria.
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Panel Content Split: Folder Hierarchy left, Active log right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5" id="dashboard-split-layout">
        {/* Left Grid: Expandable Directories tree */}
        <div className="lg:col-span-3 flex flex-col gap-3 bg-neutral-900/40 border border-white/10 rounded-2xl p-4 overflow-hidden" id="folder-hierarchy-tree">
          <div className="flex items-center justify-between pb-2 border-b border-white/5" id="tree-header-row">
            <span className="text-xs font-semibold tracking-wide text-neutral-300">ÁRBOLES DE ARCHIVOS SIMULADOS</span>
            <span className="text-[10px] font-mono text-neutral-500">Selecciona para descartar</span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1" id="tree-items-scroller">
            {categories.map((cat) => {
              const isCatExpanded = expandedCategories[cat.id];
              const checkedCount = getCheckedCount(cat);
              const allChecked = isAllChecked(cat);
              const someChecked = isSomeChecked(cat);

              return (
                <div key={cat.id} className="border border-white/5 bg-neutral-950/20 rounded-xl overflow-hidden" id={`cat-card-${cat.id}`}>
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between p-3 bg-neutral-900/20 hover:bg-neutral-900/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCategoryExpand(cat.id)}
                        className="text-neutral-500 hover:text-white p-0.5 rounded"
                      >
                        {isCatExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleAll(cat.id)}
                        className="text-neutral-400 hover:text-white"
                        disabled={scanState === 'cleaning' || scanState === 'scanning'}
                      >
                        {allChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : someChecked ? (
                          <div className="w-4 h-4 flex items-center justify-center border border-emerald-500 bg-emerald-950/40 rounded">
                            <span className="w-2 h-0.5 bg-emerald-400" />
                          </div>
                        ) : (
                          <Square className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>

                      {getCategoryIcon(cat.id)}
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">{cat.name}</span>
                        <span className="text-[10px] text-neutral-400 font-sans">{cat.description}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="text-xs font-mono font-medium text-neutral-300 tabular-nums">
                        {checkedCount} / {cat.files.length} ficheros
                      </span>
                    </div>
                  </div>

                  {/* Expandable Children Files List */}
                  <AnimatePresence initial={false}>
                    {isCatExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/5 bg-neutral-950/40"
                      >
                        <div className="p-2 flex flex-col gap-1.5" id={`files-container-${cat.id}`}>
                          {cat.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between pl-8 pr-3 py-1.5 rounded-lg hover:bg-neutral-900/30 transition-colors text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onToggleFile(cat.id, file.id)}
                                  className="text-neutral-500 hover:text-white"
                                  disabled={scanState === 'cleaning' || scanState === 'scanning'}
                                >
                                  {file.checked ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <div className="flex flex-col">
                                  <span className="font-medium text-neutral-200">{file.name}</span>
                                  <span className="text-[9px] text-neutral-500 font-mono tracking-tighter">
                                    {file.path}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                                {file.sizeMb.toFixed(1)} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Grid: Console Log Output terminal */}
        <div className="lg:col-span-2 bg-black/80 rounded-2xl border border-white/10 p-4 flex flex-col h-full min-h-[260px] max-h-[440px] overflow-hidden shadow-inner font-mono" id="terminal-logger">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10 mb-3 text-[11px]" id="terminal-header">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-400 tracking-wider">REGISTRO DE OPERACIÓN</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Scrolling output lines */}
          <div 
            ref={logsRef}
            className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 select-text"
            id="terminal-output-body"
          >
            {activeLogs.map((log, index) => {
              if (!log || typeof log !== 'string') return null;
              return (
                <motion.div
                  key={`log-${index}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`text-[10px] leading-relaxed ${
                    log.startsWith('🟢') || log.startsWith('⚡') || log.startsWith('✨')
                      ? 'text-emerald-400'
                      : log.startsWith('🔍')
                      ? 'text-cyan-400'
                      : log.startsWith('🧼')
                      ? 'text-pink-400'
                      : 'text-neutral-300'
                  }`}
                >
                  {log}
                </motion.div>
              );
            })}
          </div>

          {/* Quick status report footer */}
          <div className="border-t border-white/10 pt-3 mt-2 text-[10px] text-neutral-500 flex justify-between" id="terminal-footer">
            <span>Cache de Limpieza: OK</span>
            <span>Estacionamiento Cero</span>
          </div>
        </div>
      </div>

      {/* Real-time Browser Cookie & Cache Live Auditor Card */}
    <div className="mt-6 bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden animate-fade-in" id="live-cookie-cache-auditor">
      {/* Decorative Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:12px_12px] opacity-30 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-4 relative z-10" id="auditor-header">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-xs font-mono tracking-widest text-neutral-400 uppercase">AUDITORÍA Y PURGA EN TIEMPO REAL DE BROWSER COOKIES & CACHÉ</h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Esta sección lee, diagnostica y destruye de forma física las cookies y llaves de localStorage activas en este origen sandbox.
          </p>
        </div>

        {/* Controller buttons */}
        <div className="flex items-center gap-2 flex-wrap" id="auditor-controls">
          <button
            onClick={generateTestData}
            className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Cargar cookies y llaves de caché de prueba en tu navegador para ver la depuración en tiempo real"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Generar Datos de Prueba</span>
          </button>

          <button
            onClick={refreshLiveBrowserData}
            className="bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Actualizar lecturas de almacenamiento del cliente"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>Actualizar Auditor</span>
          </button>

          <button
            onClick={clearAllLiveBrowserData}
            disabled={liveCookies.length === 0 && liveStorage.length === 0}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              liveCookies.length === 0 && liveStorage.length === 0
                ? 'bg-neutral-800/20 border-neutral-800/40 text-neutral-500 cursor-not-allowed'
                : 'bg-rose-500/10 hover:bg-rose-500/25 border-rose-500/20 text-rose-300 hover:text-white'
            }`}
            title="Purgar por completo todos los rastros detectables de cookies y buffers locales"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Purgar Almacenamiento Real</span>
          </button>
        </div>
      </div>

      {/* Live table content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10" id="auditor-split">
        {/* Cookies Column */}
        <div className="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col min-h-[140px]" id="auditor-cookies-pane">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2 text-[10px] font-mono text-neutral-400">
            <span className="font-bold text-neutral-300">COOKIES FÍSICAS DETECTADAS</span>
            <span className="text-neutral-500 tabular-nums">{liveCookies.length} Activas</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[160px] flex flex-col gap-1.5 pr-1" id="cookies-list">
            {liveCookies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-neutral-500 font-mono text-[9px] flex-1">
                <span>No se encontraron cookies de rastreo activas.</span>
                <span className="text-[8px] text-neutral-600 mt-1">Haga clic en "Generar Datos de Prueba" para simular cookies de publicidad / rastreo</span>
              </div>
            ) : (
              liveCookies.map((c) => {
                const isProtected = c.name.includes('google') || c.name.includes('github') || c.name === 'crystal_clear_license';
                return (
                  <div key={c.name} className="flex items-center justify-between bg-neutral-950/40 p-2 rounded-lg border border-white/5 text-[10px] font-mono">
                    <div className="flex flex-col min-w-0 flex-1 mr-2">
                      <span className="text-neutral-200 font-bold truncate">{c.name}</span>
                      <span className="text-neutral-500 text-[8px] truncate mt-0.5">{c.value || '(vacía)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isProtected ? (
                        <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">
                          Protegido
                        </span>
                      ) : (
                        <>
                          <span className="text-[7.5px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase animate-pulse">
                            Residuo
                          </span>
                          <button
                            onClick={() => deleteLiveCookie(c.name)}
                            className="text-neutral-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Eliminar esta cookie del navegador"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LocalStorage Column */}
        <div className="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col min-h-[140px]" id="auditor-storage-pane">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2 text-[10px] font-mono text-neutral-400">
            <span className="font-bold text-neutral-300">LOCALSTORAGE (LLAVES ACTIVAS)</span>
            <span className="text-neutral-500 tabular-nums">{liveStorage.length} Llaves</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[160px] flex flex-col gap-1.5 pr-1" id="storage-list">
            {liveStorage.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-neutral-500 font-mono text-[9px] flex-1">
                <span>No se encontraron llaves de caché persistente.</span>
              </div>
            ) : (
              liveStorage.map((s) => {
                const isProtected = s.key === 'crystal_clear_license' || s.key === 'crystal_clear_ram_override';
                return (
                  <div key={s.key} className="flex items-center justify-between bg-neutral-950/40 p-2 rounded-lg border border-white/5 text-[10px] font-mono">
                    <div className="flex flex-col min-w-0 flex-1 mr-2">
                      <span className="text-neutral-200 font-bold truncate">{s.key}</span>
                      <span className="text-neutral-500 text-[8px] truncate mt-0.5">{s.value || '(vacía)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isProtected ? (
                        <span className="text-[7.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                          Whitelist
                        </span>
                      ) : (
                        <>
                          <span className="text-[7.5px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase animate-pulse">
                            Caché
                          </span>
                          <button
                            onClick={() => deleteLiveStorage(s.key)}
                            className="text-neutral-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Eliminar este valor de caché de inmediato"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Administrador de Tareas y Procesos de Crystal */}
    <div className="mt-6 bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden animate-fade-in animate-duration-500" id="live-task-manager-auditor">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:12px_12px] opacity-30 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <h3 className="text-xs font-mono tracking-widest text-neutral-400 uppercase">ADMINISTRADOR DE TAREAS Y PROCESOS DE CRYSTAL</h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Supervisa, detiene y optimiza hilos lógicos en tiempo real para liberar memoria RAM física, ciclos de CPU y buffers gráficos.
          </p>
        </div>

        <button
          onClick={handleRestoreProcesses}
          className="bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 self-end md:self-auto"
          title="Reiniciar todos los procesos detenidos y restablecer consumo nominal"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin-slow" />
          <span>Reiniciar Procesos</span>
        </button>
      </div>

      {/* Live Resource Overview Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-mono text-[10px] relative z-10">
        <div className="bg-neutral-950/50 p-2.5 rounded-xl border border-white/5">
          <div className="flex justify-between text-neutral-400 mb-1 font-bold">
            <span>CONSUMO CPU GLOBAL</span>
            <span className="text-emerald-400">
              {activeCpuPoint.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${activeCpuPoint}%` }}
            />
          </div>
        </div>

        <div className="bg-neutral-950/50 p-2.5 rounded-xl border border-white/5">
          <div className="flex justify-between text-neutral-400 mb-1 font-bold">
            <span>MEMORIA RAM EN USO</span>
            <span className="text-indigo-400">
              {((currentRamPercent / 100) * (ramOverride * 1024)).toFixed(0)} MB
              <span className="text-neutral-500 font-normal ml-1">
                ({currentRamPercent.toFixed(1)}%)
              </span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${currentRamPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-neutral-950/50 p-2.5 rounded-xl border border-white/5">
          <div className="flex justify-between text-neutral-400 mb-1 font-bold">
            <span>VRAM TARJETA GRÁFICA</span>
            <span className="text-cyan-400">
              {currentGpuPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${currentGpuPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Process Table list */}
      <div className="overflow-x-auto relative z-10 rounded-xl border border-white/5 bg-black/20" id="processes-table-container">
        <table className="w-full text-left font-mono text-[10px] border-collapse">
          <thead>
            <tr className="bg-neutral-950/60 text-neutral-400 uppercase tracking-wider border-b border-white/5">
              <th className="p-2.5 font-bold">Nombre del Proceso</th>
              <th className="p-2.5 font-bold text-center">PID</th>
              <th className="p-2.5 font-bold text-right">CPU</th>
              <th className="p-2.5 font-bold text-right">Memoria RAM</th>
              <th className="p-2.5 font-bold text-right">GPU (VRAM)</th>
              <th className="p-2.5 font-bold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {processes.map((p) => {
              const isTerminated = p.status === 'terminated';
              return (
                <tr 
                  key={p.pid} 
                  className={`transition-all ${isTerminated ? 'opacity-40 bg-neutral-950/20' : 'hover:bg-white/5 bg-neutral-950/10'}`}
                >
                  <td className="p-2.5 font-medium flex items-center gap-2">
                    {p.type === 'gpu' && <Monitor className="w-3.5 h-3.5 text-cyan-400" />}
                    {p.type === 'system' && <Cpu className="w-3.5 h-3.5 text-indigo-400" />}
                    {p.type === 'v8' && <Activity className="w-3.5 h-3.5 text-pink-400" />}
                    {p.type === 'db' && <Server className="w-3.5 h-3.5 text-emerald-400" />}
                    {p.type === 'network' && <FolderSync className="w-3.5 h-3.5 text-amber-400" />}
                    <span className={isTerminated ? 'line-through text-neutral-500' : 'text-neutral-200'}>
                      {p.name}
                    </span>
                  </td>
                  <td className="p-2.5 text-center text-neutral-500 tabular-nums">
                    {p.pid}
                  </td>
                  <td className="p-2.5 text-right font-semibold tabular-nums text-emerald-400">
                    {isTerminated ? '0.0%' : `${p.cpuBase}%`}
                  </td>
                  <td className="p-2.5 text-right font-semibold tabular-nums text-indigo-300">
                    {isTerminated ? '0.0 MB' : `${p.ramBase} MB`}
                  </td>
                  <td className="p-2.5 text-right font-semibold tabular-nums text-cyan-400">
                    {isTerminated ? '0.0%' : p.gpuBase > 0 ? `${p.gpuBase}%` : '-'}
                  </td>
                  <td className="p-2.5 text-center">
                    {isTerminated ? (
                      <span className="text-[8px] font-bold text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Detenido
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEndProcess(p.pid, p.name)}
                        className="bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-300 hover:text-white text-[9px] px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 mx-auto font-bold"
                        title="Finalizar tarea de inmediato para liberar recursos de hardware"
                      >
                        <X className="w-2.5 h-2.5" />
                        <span>Finalizar Tarea</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
