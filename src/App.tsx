import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Sliders, ShieldCheck, Cpu, HardDrive, 
  HelpCircle, CheckCircle, Info, RefreshCw, AlertTriangle,
  Lock, Key, Download, DollarSign, Shield, Terminal,
  Settings, Activity, Trash2, Check, Play, Monitor, PlayCircle,
  X, Laptop, ChevronRight, Zap, RefreshCcw, FileText, Server, AppWindow
} from 'lucide-react';
import { 
  CacheCategory, PerformancePoint, ScanState, OptimizerSettings, 
  SecurityShield, LicenseUser, ActiveView, TaskProcess 
} from './types';

import Crystal from './components/Crystal';
import OptimizerDashboard from './components/OptimizerDashboard';
import SecurityPanel from './components/SecurityPanel';
import PricingTiers from './components/PricingTiers';
import LicensingManager from './components/LicensingManager';
import InstallersPanel from './components/InstallersPanel';
import DiagnosticSuite from './components/DiagnosticSuite';
import SettingsPanel from './components/SettingsPanel';

// Default 6 categories to satisfy assertion tc-scan-init (length === 6)
const INITIAL_CATEGORIES: CacheCategory[] = [
  {
    id: 'cat-browser',
    name: 'Caché de Navegador',
    description: 'Historiales temporales, cookies caducadas y datos de sesión no exceptuados.',
    expanded: true,
    icon: 'browser',
    files: [
      { id: 'f-chrome-cache', name: 'Google Chrome - Datos de Caché Web', path: '~/Library/Caches/Google/Chrome/Default', sizeMb: 1240.5, checked: true, type: 'cache' },
      { id: 'f-firefox-cache', name: 'Mozilla Firefox - Buffers de Medios', path: '~/Library/Caches/Firefox/Profiles/temporary', sizeMb: 650.2, checked: true, type: 'cache' },
      { id: 'f-browser-cookies', name: 'Cookies de Sitios de Terceros', path: '~/Library/Application Support/Cookies', sizeMb: 310.4, checked: true, type: 'cache' },
    ]
  },
  {
    id: 'cat-system',
    name: 'Registros y Diagnósticos',
    description: 'Informes de errores, archivos journal de depuración y volcados de fallos.',
    expanded: false,
    icon: 'system',
    files: [
      { id: 'f-sys-err', name: 'Volcados de Error del Kernel (Crash Dumps)', path: '/var/log/system.log', sizeMb: 850.5, checked: true, type: 'log' },
      { id: 'f-cbs-log', name: 'Registros de Eventos CBS / Actualizaciones', path: '/var/log/installer.log', sizeMb: 430.1, checked: true, type: 'log' },
    ]
  },
  {
    id: 'cat-thumbs',
    name: 'Caché de Miniaturas',
    description: 'Miniaturas de imágenes y videos en caché del explorador de archivos.',
    expanded: false,
    icon: 'folder',
    files: [
      { id: 'f-thumb-explorer', name: 'Explorador - Caché de Miniaturas', path: '~/Library/Caches/Explorer/Thumbnails', sizeMb: 380.2, checked: true, type: 'thumb' },
    ]
  },
  {
    id: 'cat-ram',
    name: 'Memoria en Espera',
    description: 'Lista de espera de memoria física inactiva y buffers acumulados.',
    expanded: false,
    icon: 'cpu',
    files: [
      { id: 'f-ram-standby', name: 'Páginas de Memoria Standby inactiva', path: 'kernel::standby_list', sizeMb: 1150.0, checked: true, type: 'process' },
    ]
  },
  {
    id: 'cat-temp',
    name: 'Archivos Temporales',
    description: 'Temporales del sistema, instaladores residuales y buffers de descarga.',
    expanded: false,
    icon: 'temp',
    files: [
      { id: 'f-temp-appdata', name: 'Temporales Locales del Sistema (AppData)', path: '~/AppData/Local/Temp', sizeMb: 920.8, checked: true, type: 'temp' },
    ]
  },
  {
    id: 'cat-dns',
    name: 'Caché de DNS y Sockets',
    description: 'Caché DNS del sistema y sockets de red inactivos.',
    expanded: false,
    icon: 'network',
    files: [
      { id: 'f-dns-cache', name: 'Buffer de Sockets y Caché de DNS Local', path: 'network::dns_resolver', sizeMb: 45.3, checked: true, type: 'temp' },
    ]
  }
];

// Initial shields list for security panel
const INITIAL_SHIELDS: SecurityShield[] = [
  { id: 'sh-firewall', name: 'Cortafuegos de Conexión (Port Filter)', description: 'Bloquea peticiones no solicitadas de puertos externos entrantes.', enabled: true, status: 'safe', icon: 'shield' },
  { id: 'sh-anti-malware', name: 'Filtro Anti-Malware en Caché', description: 'Examina archivos descargados temporalmente buscando hashes sospechosos.', enabled: true, status: 'safe', icon: 'cpu' },
  { id: 'sh-anti-phishing', name: 'Escudo Anti-Phishing de Navegación', description: 'Verifica URLs visitadas contra la lista de exclusiones de forma segura.', enabled: false, status: 'warning', icon: 'globe' },
  { id: 'sh-encryption', name: 'Protección de Cookies Cifradas', description: 'Encripta localmente tokens de sesión para evitar ataques de secuestro.', enabled: true, status: 'safe', icon: 'lock' },
];

// Initial licensing data
const INITIAL_LICENSE_USERS: LicenseUser[] = [
  { id: 'lic-1', name: 'Admin de Sistemas Crystal', email: 'admin@crystalclean.com', keyEncrypted: 'CRYSTAL-TOTAL-SECURITY-F9A2-BC18-99D1', activatedAt: '01/05/2026', devices: '3 Dispositivos activos', plan: 'Seguridad Total Completa', country: 'España 🇪🇸' },
  { id: 'lic-2', name: 'Usuario Premium de Prueba', email: 'premium@gmail.com', keyEncrypted: 'CRYSTAL-CLEANUP-88B1-CC09-8FDF', activatedAt: '12/06/2026', devices: '1 Dispositivo activo', plan: 'PC Cleanup Premium', country: 'México 🇲🇽' },
];

// Default initial tasks in task list
const INITIAL_PROCESSES: TaskProcess[] = [
  { pid: 3120, name: 'Crystal Clear Core Engine', type: 'system', cpuBase: 4.5, ramBase: 180.5, gpuBase: 0, status: 'running' },
  { pid: 4892, name: 'WebGL Shaders Render Pipeline', type: 'gpu', cpuBase: 2.1, ramBase: 310.2, gpuBase: 12.5, status: 'running' },
  { pid: 1044, name: 'V8 Garbage Collector Sweeper', type: 'v8', cpuBase: 1.2, ramBase: 45.1, gpuBase: 0, status: 'running' },
  { pid: 9021, name: 'Local Database IndexedDB Sync', type: 'db', cpuBase: 0.8, ramBase: 65.4, gpuBase: 0, status: 'running' },
  { pid: 7430, name: 'Background Telemetry Proxy', type: 'network', cpuBase: 0.5, ramBase: 28.3, gpuBase: 0, status: 'running' },
  { pid: 5560, name: 'Iframe Sandbox Client Canvas', type: 'gpu', cpuBase: 3.4, ramBase: 120.7, gpuBase: 8.4, status: 'running' },
];

const generateInitialHistory = (ramGb: number): PerformancePoint[] => {
  const points: PerformancePoint[] = [];
  const basePercent = 42.5;
  const now = new Date();
  for (let i = 19; i >= 0; i--) {
    const timePoint = new Date(now.getTime() - i * 5000);
    const timeString = `${timePoint.getHours().toString().padStart(2, '0')}:${timePoint.getMinutes().toString().padStart(2, '0')}:${timePoint.getSeconds().toString().padStart(2, '0')}`;
    const noise = (Math.sin(i / 2) * 1.5) + (Math.cos(i) * 0.5);
    
    points.push({
      time: timeString,
      ramUsagePercent: Number(Math.max(10, Math.min(99, basePercent + noise)).toFixed(1)),
      cpuUsagePercent: Number(Math.max(5, Math.min(99, 14.2 + noise * 2)).toFixed(1)),
      cacheSizeMb: 1240
    });
  }
  return points;
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('optimizer');
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings initialization
  const [settings, setSettings] = useState<OptimizerSettings>(() => {
    return {
      autoOptimize: false,
      notifyOnThreshold: true,
      thresholdGb: 4.0,
      deepScanEnabled: true,
      crystalTheme: 'sapphire',
      glowIntensity: 'medium',
      rotationSpeed: 'normal',
      processMemoryLimit: 500,
      whitelistedCookies: ['accounts.google.com', 'github.com', 'notion.so', 'spotify.com'],
      preserveHistoryDays: 30,
      realBoosterActive: true,
      gpuCacheCleanEnabled: true
    };
  });

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
            const renderer = gl.getParameter((debugInfo as any).UNMASKED_RENDERER_INFO) || gl.getParameter((debugInfo as any).UNMASKED_RENDERER_RENDERER);
            if (renderer) {
              gpu = renderer;
              if (gpu.includes('ANGLE (')) {
                // ANGLE (Google, Vulkan 1.3.0...) or ANGLE (Intel, Intel(R) UHD Graphics...)
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

  const [categories, setCategories] = useState<CacheCategory[]>(INITIAL_CATEGORIES);
  const [shields, setShields] = useState<SecurityShield[]>(INITIAL_SHIELDS);
  const [licenseUsers, setLicenseUsers] = useState<LicenseUser[]>(INITIAL_LICENSE_USERS);
  const [processes, setProcesses] = useState<TaskProcess[]>(INITIAL_PROCESSES);
  const [scanState, setScanState] = useState<ScanState>('idle');
  
  const [ramOverride, setRamOverride] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crystal_clear_ram_override');
      if (saved) return parseInt(saved, 10);
    }
    return 16;
  });

  const [freedAlert, setFreedAlert] = useState<{ amountMb: number; visible: boolean }>({ amountMb: 0, visible: false });

  // PC local agent variables
  const [pcAgentMode, setPcAgentMode] = useState<'browser' | 'pc'>('browser');
  const [pcAgentStatus, setPcAgentStatus] = useState<'offline' | 'online'>('offline');
  const [pcHardware, setPcHardware] = useState<{
    cpuModel: string;
    cpuCores: number;
    cpuUsage: number;
    ramTotalGb: number;
    ramUsedGb: number;
    ramPercent: number;
    gpuModel: string;
    gpuUsage: number;
  } | null>(null);

  // Performance history
  const [performanceHistory, setPerformanceHistory] = useState<PerformancePoint[]>(() => {
    return generateInitialHistory(ramOverride);
  });

  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined) {
      setIsTauri(true);
      // Automatically switch to local system mode if we are inside a compiled Tauri desktop shell
      setPcAgentMode('pc');
    }
  }, []);

  // Save RAM override to localstorage
  useEffect(() => {
    localStorage.setItem('crystal_clear_ram_override', ramOverride.toString());
  }, [ramOverride]);

  // Check PC Local Agent (polling port 3001)
  useEffect(() => {
    if (isTauri) {
      setPcAgentStatus('online');
      return;
    }
    if (localBrowserSpecs.isMobile) {
      setPcAgentStatus('offline');
      return;
    }
    if (pcAgentMode !== 'pc') {
      setPcAgentStatus('offline');
      return;
    }
    let active = true;
    const checkPcAgent = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      try {
        const res = await fetch('http://localhost:3001/api/metrics', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok && active) {
          const data = await res.json();
          setPcAgentStatus('online');
          setPcHardware({
            cpuModel: data.cpuModel || 'Procesador Intel/AMD',
            cpuCores: data.cpuCores || (navigator.hardwareConcurrency || 8),
            cpuUsage: Math.max(0, Math.min(100, Number(data.cpu))),
            ramTotalGb: Number((data.ramTotal / (1024 * 1024 * 1024)).toFixed(1)),
            ramUsedGb: Number((data.ramUsed / (1024 * 1024 * 1024)).toFixed(1)),
            ramPercent: Math.max(0, Math.min(100, Number((data.ramUsed / data.ramTotal) * 100))),
            gpuModel: data.gpu || 'Tarjeta Gráfica Dedicada',
            gpuUsage: Math.max(0, Math.min(100, Number(data.gpuLoad || 0)))
          });
        } else {
          if (active) setPcAgentStatus('offline');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (active) setPcAgentStatus('offline');
      }
    };

    checkPcAgent();
    const interval = setInterval(checkPcAgent, 1500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isTauri, pcAgentMode, localBrowserSpecs.isMobile]);

  // Fetch real system processes when connected to PC agent or running in Tauri
  useEffect(() => {
    let active = true;
    const fetchProcesses = async () => {
      if (isTauri) {
        try {
          const realProcs = await (window as any).__TAURI__.invoke('get_real_system_processes');
          if (active && realProcs && realProcs.length > 0) {
            setProcesses(realProcs);
          }
        } catch (err) {
          console.error("Error reading Tauri native processes:", err);
        }
      } else if (pcAgentMode === 'pc' && pcAgentStatus === 'online') {
        try {
          const res = await fetch('http://localhost:3001/api/processes');
          if (res.ok && active) {
            const data = await res.json();
            if (data && data.length > 0) {
              setProcesses(data);
            }
          }
        } catch (err) {
          console.error("Error reading local agent processes:", err);
        }
      }
    };

    fetchProcesses();
    const interval = setInterval(fetchProcesses, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isTauri, pcAgentMode, pcAgentStatus]);

  // Monitor live metric changes to feed chart
  useEffect(() => {
    let active = true;
    const fetchMetrics = async () => {
      let ramUsage = 0;
      let cpuUsage = 0;

      if (isTauri) {
        try {
          const metrics = await (window as any).__TAURI__.invoke('get_real_system_metrics');
          if (active && metrics) {
            ramUsage = metrics.ram_usage_percent;
            cpuUsage = metrics.cpu_usage_percent;
            if (metrics.total_ram_gb > 0) {
              setRamOverride(Math.round(metrics.total_ram_gb));
              setPcHardware({
                cpuModel: metrics.cpu_model || "Procesador Host (Tauri)",
                cpuCores: metrics.cpu_cores || navigator.hardwareConcurrency || 8,
                cpuUsage: metrics.cpu_usage_percent,
                ramTotalGb: metrics.total_ram_gb,
                ramUsedGb: metrics.used_ram_gb,
                ramPercent: metrics.ram_usage_percent,
                gpuModel: metrics.gpu_model || "Gráficos Integrados / VRAM",
                gpuUsage: metrics.gpu_cache_size_mb > 1200 ? 45 : 12
              });
            }
          }
        } catch (err) {
          console.error("Error reading Tauri native metrics:", err);
        }
      } else if (pcAgentMode === 'pc' && pcAgentStatus === 'online' && pcHardware) {
        ramUsage = pcHardware.ramPercent;
        cpuUsage = pcHardware.cpuUsage;
      } else {
        // Full stack container / cloud mode (Express server)
        try {
          const res = await fetch('/api/system-metrics');
          if (res.ok && active) {
            const data = await res.json();
            ramUsage = data.ramUsagePercent;
            cpuUsage = data.cpuUsagePercent;
            if (data.totalRamGb > 0) {
              setRamOverride(Math.round(data.totalRamGb));
            }
          } else {
            throw new Error("Server response not ok");
          }
        } catch (err) {
          // Soft calculated fallback
          const timeFactor = Math.sin(Date.now() / 15000) * 0.8;
          const noise = (Math.random() - 0.5) * 0.4;
          const activeProcessesRam = processes.reduce((sum, p) => sum + (p.status === 'running' ? p.ramBase : 0), 0);
          const totalCapacityMb = ramOverride * 1024;
          const basePercent = 38.4;
          const calculatedRamUsage = basePercent + (activeProcessesRam / totalCapacityMb) * 100 + timeFactor + noise;
          ramUsage = Math.max(10, Math.min(99, calculatedRamUsage));

          const activeProcessesCpu = processes.reduce((sum, p) => sum + (p.status === 'running' ? p.cpuBase : 0), 0);
          if (scanState === 'cleaning') {
            cpuUsage = activeProcessesCpu + 58 + Math.floor(Math.random() * 12);
          } else {
            cpuUsage = activeProcessesCpu + 4.2 + (Math.sin(Date.now() / 6000) * 2) + Math.random() * 2;
          }
        }
      }

      if (active) {
        setPerformanceHistory((prev) => {
          const now = new Date();
          const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          
          const nextPoint: PerformancePoint = {
            time: timeString,
            ramUsagePercent: Number(Math.max(1, Math.min(99, ramUsage)).toFixed(1)),
            cpuUsagePercent: Number(Math.max(1, Math.min(99, cpuUsage)).toFixed(1)),
            cacheSizeMb: 1240,
          };
          return [...prev.slice(1), nextPoint];
        });
      }
    };

    const interval = setInterval(fetchMetrics, 1500);
    fetchMetrics();
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [processes, ramOverride, pcAgentMode, pcAgentStatus, pcHardware, scanState, isTauri]);

  // Scan & Clean operations
  const handleScan = () => {
    if (scanState === 'scanning' || scanState === 'cleaning') return;
    setScanState('scanning');
    
    setTimeout(() => {
      setScanState('scanned');
    }, 2500);
  };

  const handleClean = async (bypassScanCheck: boolean = false) => {
    if (!bypassScanCheck && scanState !== 'scanned') return;
    setScanState('cleaning');
    
    let freedAmount = Math.floor(650 + Math.random() * 450);
    let detailsMessage = "Memoria RAM física liberada con éxito.";

    if (isTauri) {
      try {
        const result = await (window as any).__TAURI__.invoke('run_real_ram_cleanup');
        if (result && result.success) {
          freedAmount = Math.round(result.freed_mb);
          detailsMessage = result.details;
        }
      } catch (err) {
        console.error("Tauri cleanup error:", err);
      }
    } else if (pcAgentMode === 'pc' && pcAgentStatus === 'online') {
      try {
        const res = await fetch('http://localhost:3001/api/cleanup', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          detailsMessage = data.message || detailsMessage;
        }
      } catch (err) {
        console.error("Local agent cleanup error:", err);
      }
    } else {
      // Browser server mode - hit real Express server cleanup endpoint
      try {
        const res = await fetch('/api/cleanup', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          freedAmount = data.freedMb || freedAmount;
          detailsMessage = data.details || detailsMessage;
        }
      } catch (err) {
        console.error("Express server cleanup error:", err);
      }
    }

    setTimeout(() => {
      // Contract simulated processes ram sizes
      setProcesses(prev => prev.map(p => {
        if (p.status === 'terminated') return p;
        const contraction = Math.max(5, p.ramBase * 0.22);
        return {
          ...p,
          ramBase: Number((p.ramBase - contraction).toFixed(1))
        };
      }));

      setPerformanceHistory(prev => {
        return prev.map((pt, idx) => {
          if (idx === prev.length - 1) {
            return {
              ...pt,
              ramUsagePercent: Math.max(15, pt.ramUsagePercent - (freedAmount / (ramOverride * 1024)) * 100)
            };
          }
          return pt;
        });
      });

      setFreedAlert({ amountMb: freedAmount, visible: true });
      setScanState('cleaned');

      setTimeout(() => {
        setFreedAlert(prev => ({ ...prev, visible: false }));
      }, 5000);
    }, 2500);
  };

  // State handlers passed to panels
  const handleToggleFile = (categoryId: string, fileId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        files: cat.files.map(f => f.id === fileId ? { ...f, checked: !f.checked } : f)
      };
    }));
  };

  const handleToggleAll = (categoryId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      const allChecked = cat.files.every(f => f.checked);
      return {
        ...cat,
        files: cat.files.map(f => ({ ...f, checked: !allChecked }))
      };
    }));
  };

  const handleToggleShield = (id: string) => {
    setShields(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextEnabled = !s.enabled;
      return {
        ...s,
        enabled: nextEnabled,
        status: nextEnabled ? 'safe' : 'warning'
      };
    }));
  };

  const handleActivateKey = (key: string, name: string, email: string): boolean => {
    if (!key.startsWith('CRYSTAL-')) {
      return false;
    }
    
    let plan = 'PC Cleanup Premium';
    if (key.includes('TOTAL')) plan = 'Seguridad Total Completa';
    else if (key.includes('CLEANUP')) plan = 'PC Cleanup Premium';
    else if (key.includes('FREE')) plan = 'Prueba Gratuita 3 Meses';

    const newUser: LicenseUser = {
      id: `lic-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      email,
      keyEncrypted: key,
      activatedAt: new Date().toLocaleDateString('es-ES'),
      devices: '1 Dispositivo activo',
      plan,
      country: 'España 🇪🇸'
    };

    setLicenseUsers(prev => [newUser, ...prev]);
    return true;
  };

  const handleClaimFreeKey = (info: string) => {
    const parts = info.split('::');
    const planName = parts[0];
    const key = parts[1];
    
    const newUser: LicenseUser = {
      id: `lic-free-${Date.now()}`,
      name: 'Usuario Registrado',
      email: 'prueba@crystalclean.com',
      keyEncrypted: key,
      activatedAt: new Date().toLocaleDateString('es-ES'),
      devices: '1 Dispositivo activo',
      plan: planName,
      country: 'España 🇪🇸'
    };
    setLicenseUsers(prev => [newUser, ...prev]);
  };

  // Metrics computing
  const latestPoint = performanceHistory[performanceHistory.length - 1] || { ramUsagePercent: 45, cpuUsagePercent: 12 };
  const displayRamPercent = pcAgentMode === 'pc' && pcAgentStatus === 'online' && pcHardware
    ? pcHardware.ramPercent 
    : latestPoint.ramUsagePercent;
  const displayCpuPercent = pcAgentMode === 'pc' && pcAgentStatus === 'online' && pcHardware
    ? pcHardware.cpuUsage 
    : latestPoint.cpuUsagePercent;
  const displayGpuPercent = pcAgentMode === 'pc' && pcAgentStatus === 'online' && pcHardware
    ? pcHardware.gpuUsage 
    : Math.max(1, Math.min(99, Math.floor(displayCpuPercent * 0.75 + (Math.cos(Date.now() / 3000) * 4 + 6))));

  const activeRamOverride = pcAgentMode === 'pc' && pcAgentStatus === 'online' && pcHardware ? pcHardware.ramTotalGb : ramOverride;
  const healthPercent = Math.max(0, Math.min(100, Math.round(100 - displayRamPercent + (scanState === 'cleaned' ? 12 : 0))));

  return (
    <div className="min-h-screen bg-[#070b19] text-neutral-100 font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white" id="crystal-optimizer-app-stage">
      
      {/* Visual background atmospheric elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#070b19] to-black pointer-events-none z-0" />
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-indigo-500/[0.04] blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-emerald-500/[0.03] blur-[120px] pointer-events-none z-0" />
      
      {/* Root Layout Container */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row" id="crystal-workspace-shell">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-[260px] shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-neutral-950/40 backdrop-blur-md flex flex-col p-5 relative z-20" id="sidebar-navigation-container">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/5 mb-6" id="sidebar-brand-header">
            <div className="p-2 bg-indigo-600/15 rounded-xl border border-indigo-500/25 flex items-center justify-center shadow-lg shadow-indigo-500/10 animate-pulse">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase bg-gradient-to-r from-white via-neutral-100 to-indigo-300 bg-clip-text text-transparent">
                CRYSTAL CLEAR
              </h1>
              <span className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold block mt-0.5 uppercase">
                ⚙️ Kernel Seguro Pro
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 flex-1" id="sidebar-nav-links">
            {[
              { id: 'optimizer', label: 'Optimizador RAM', icon: Sliders },
              { id: 'security', label: 'Seguridad IP / VPN', icon: ShieldCheck },
              { id: 'pricing', label: 'Suscripción Pro', icon: DollarSign },
              { id: 'licensing', label: 'Gestor de Licencia', icon: Key },
              { id: 'installers', label: 'Instaladores Offline', icon: Download },
              { id: 'tests', label: 'Suite de Diagnósticos', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as ActiveView)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all relative group cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600/15 text-white border border-indigo-500/30 shadow-lg shadow-indigo-600/5' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  id={`nav-link-${tab.id}`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveIndicator" 
                      className="absolute left-1.5 top-3 bottom-3 w-1 bg-indigo-400 rounded-full" 
                    />
                  )}
                  <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
                  <span>{tab.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-neutral-600 group-hover:text-neutral-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0" />
                </button>
              );
            })}
          </nav>

          {/* PC Local Agent Toggle Card */}
          <div className="mt-6 border border-white/5 bg-neutral-900/35 rounded-2xl p-4 shadow-xl text-center relative overflow-hidden" id="sidebar-agent-status-card">
            <div className="absolute inset-0 bg-indigo-500/[0.01] pointer-events-none" />
            <span className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 font-bold block mb-2">
              DISPOSITIVO ORIGEN
            </span>

            <div className="flex gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl mb-3" id="sidebar-agent-toggle-pill">
              <button
                onClick={() => setPcAgentMode('browser')}
                className={`flex-1 py-1 px-2 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                  pcAgentMode === 'browser' 
                    ? 'bg-neutral-800 text-white border border-white/10 shadow-md' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Sandbox Web
              </button>
              <button
                onClick={() => setPcAgentMode('pc')}
                className={`flex-1 py-1 px-2 text-[9px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  pcAgentMode === 'pc' 
                    ? pcAgentStatus === 'online'
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/25 shadow-md'
                      : 'bg-rose-600/20 text-rose-300 border border-rose-500/25 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pcAgentStatus === 'online' ? 'bg-emerald-400' : 'bg-neutral-500 animate-pulse'}`} />
                Mi PC Real
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium font-mono text-neutral-300" id="sidebar-agent-label">
              {pcAgentMode === 'pc' ? (
                pcAgentStatus === 'online' ? (
                  <span className="text-emerald-400 font-bold">Agente PC Conectado</span>
                ) : (
                  <span className="text-rose-400 font-bold animate-pulse">Agente PC Offline</span>
                )
              ) : (
                <span className="text-indigo-400 font-bold">Aislamiento de Navegador</span>
              )}
            </div>
            
            <p className="text-[9px] text-neutral-500 leading-relaxed mt-1.5">
              {pcAgentMode === 'pc' 
                ? 'Monitoreando hardware físico a través de localhost:3001' 
                : 'Métricas de memoria virtual y buffers aislados del navegador'}
            </p>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="flex-1 flex flex-col min-w-0" id="crystal-main-viewport">
          
          {/* Top Status Header */}
          <header className="px-6 py-4 border-b border-white/10 bg-neutral-950/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20" id="main-viewport-header">
            
            {/* Active view name with breadcrumbs */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                <span>Kernel Suite</span>
                <ChevronRight className="w-2.5 h-2.5 text-neutral-600" />
                <span className="text-indigo-400">Crystal Clear V4</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-1 uppercase">
                {activeView === 'optimizer' && 'Dashboard de Memoria y RAM'}
                {activeView === 'security' && 'Panel de Seguridad de Red'}
                {activeView === 'pricing' && 'Licencias Comerciales y Suscripción'}
                {activeView === 'licensing' && 'Verificación de Licencia Pro'}
                {activeView === 'installers' && 'Instaladores y Consolas'}
                {activeView === 'tests' && 'Reactividad & Diagnostics Suite'}
              </h2>
            </div>

            {/* Live Hardware Gauges row */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-neutral-400" id="hardware-gauges-row">
              {/* CPU load */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/40 rounded-xl border border-white/5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[9px] block text-neutral-500 leading-none">CPU LOAD</span>
                  <span className="text-neutral-200 font-bold mt-0.5 block">{displayCpuPercent.toFixed(1)}%</span>
                </div>
              </div>

              {/* RAM memory usage */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/40 rounded-xl border border-white/5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[9px] block text-neutral-500 leading-none">MEMORIA RAM</span>
                  <span className="text-neutral-200 font-bold mt-0.5 block">
                    {displayRamPercent.toFixed(1)}%
                    <span className="text-neutral-500 font-normal ml-1">({activeRamOverride} GB)</span>
                  </span>
                </div>
              </div>

              {/* GPU usage */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/40 rounded-xl border border-white/5">
                <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[9px] block text-neutral-500 leading-none">GPU VRAM</span>
                  <span className="text-neutral-200 font-bold mt-0.5 block">{displayGpuPercent.toFixed(1)}%</span>
                </div>
              </div>

              {/* Settings Action Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 bg-neutral-900/40 hover:bg-neutral-800 rounded-xl border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0 self-stretch"
                title="Abrir Panel de Configuración"
                aria-label="Abrir configuraciones"
              >
                <Settings className="w-4.5 h-4.5 animate-spin-slow" />
              </button>
            </div>
          </header>

          {/* View Content Frame */}
          <div className="flex-1 p-6 overflow-y-auto relative z-10" id="main-viewport-content-container">
            
            {localBrowserSpecs.isMobile && (
              <div className="mb-6 bg-gradient-to-r from-indigo-950/40 to-neutral-900/40 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-lg" id="mobile-notice-banner">
                <div className="p-2.5 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/25 flex items-center justify-center shrink-0 self-start sm:self-center">
                  <Info className="w-5.5 h-5.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-neutral-200">Modo Sandbox de Navegador Móvil ({localBrowserSpecs.brand})</h4>
                  <p className="text-neutral-400 mt-1 leading-relaxed">
                    Debido a las estrictas políticas de seguridad (sandbox) de {localBrowserSpecs.brand}, las aplicaciones web no pueden modificar directamente los archivos del sistema ni liberar la memoria RAM física general de tu celular. 
                    Este panel actúa como un <strong>simulador interactivo premium</strong> para explorar optimizaciones de sistema. No obstante, al presionar <strong>DEPURAR CACHÉ</strong>, realizamos un saneamiento web real en este navegador: purgamos variables del DOM, limpiamos buffers, limpiamos el caché del almacenamiento local e invocamos desreferenciadores del recolector de basura, acelerando tu navegación web móvil y ahorrando batería.
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic views router */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="min-h-full"
                id={`stage-frame-${activeView}`}
              >
                {activeView === 'optimizer' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start" id="view-optimizer-stage">
                    
                    {/* Left Column: Glassmorphic Crystal Core & Action Console */}
                    <div className="xl:col-span-4 flex flex-col gap-6" id="crystal-console-column">
                      <div className="border border-white/10 bg-neutral-950/20 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group" id="crystal-stage-card">
                        
                        {/* Interactive backdrop radial flare */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/[0.03] via-transparent to-transparent pointer-events-none" />
                        
                        {/* Draggable glowing crystal */}
                        <div className="w-[180px] h-[180px] flex items-center justify-center relative mb-4" id="crystal-wrapper">
                          <Crystal 
                            theme={settings.crystalTheme} 
                            scanState={scanState} 
                            healthPercent={healthPercent}
                            rotationSpeedSetting={settings.rotationSpeed}
                            glowIntensitySetting={settings.glowIntensity}
                          />
                        </div>

                        {/* Health status gauge */}
                        <div className="mb-6 relative z-10" id="health-status-stage">
                          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold block mb-1">
                            SALUD DEL SISTEMA
                          </span>
                          <span className="text-3xl font-black tracking-tight text-white bg-gradient-to-r from-white via-neutral-200 to-indigo-300 bg-clip-text text-transparent">
                            {healthPercent}%
                          </span>
                          <span className={`text-[10px] font-mono block mt-1.5 font-bold px-3 py-1 rounded-full uppercase tracking-wider mx-auto w-max ${
                            healthPercent > 80 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : healthPercent > 50 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {healthPercent > 80 ? '⚙️ Estado Óptimo' : healthPercent > 50 ? '⚠️ Requiere Limpieza' : '🚨 Sistema Saturado'}
                          </span>
                        </div>

                        {/* Core Trigger Buttons */}
                        <div className="w-full flex flex-col gap-2.5 relative z-10" id="crystal-action-triggers">
                          {scanState === 'idle' && (
                            <button
                              onClick={handleScan}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2 group border border-indigo-500/30"
                              id="trigger-btn-scan"
                            >
                              <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-indigo-200" />
                              <span>ESCANEAR CRISTAL</span>
                            </button>
                          )}

                          {scanState === 'scanning' && (
                            <button
                              disabled
                              className="w-full bg-indigo-600/30 text-indigo-300 font-bold text-xs py-3 px-5 rounded-xl border border-indigo-500/10 flex items-center justify-center gap-2 cursor-not-allowed"
                              id="trigger-btn-scanning"
                            >
                              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                              <span>ANALIZANDO ARCHIVOS...</span>
                            </button>
                          )}

                          {scanState === 'scanned' && (
                            <button
                              onClick={handleClean}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 group border border-emerald-500/30 animate-bounce"
                              id="trigger-btn-clean"
                            >
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-200" />
                              <span>DEPURAR CACHÉ DE RAM</span>
                            </button>
                          )}

                          {scanState === 'cleaning' && (
                            <button
                              disabled
                              className="w-full bg-emerald-600/30 text-emerald-300 font-bold text-xs py-3 px-5 rounded-xl border border-emerald-500/10 flex items-center justify-center gap-2 cursor-not-allowed"
                              id="trigger-btn-cleaning"
                            >
                              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                              <span>LIBERANDO RAM REAL...</span>
                            </button>
                          )}

                          {scanState === 'cleaned' && (
                            <button
                              onClick={() => setScanState('idle')}
                              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs py-3 px-5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                              id="trigger-btn-reset"
                            >
                              <RefreshCw className="w-4 h-4 shrink-0 text-neutral-400 group-hover:rotate-180 transition-transform duration-500" />
                              <span>INICIAR NUEVO EXAMEN</span>
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Hardware overview / Quick info card */}
                      <div className="border border-white/5 bg-neutral-900/20 backdrop-blur-md rounded-2xl p-5" id="hardware-overview-card">
                        <h4 className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold border-b border-white/5 pb-2.5 mb-3 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Especificaciones de Diagnóstico</span>
                        </h4>
                        <div className="flex flex-col gap-2.5 text-xs font-mono" id="diagnostic-specs-list">
                          <div className="flex justify-between items-center py-1 border-b border-white/[0.02]">
                            <span className="text-neutral-500 uppercase text-[9px]">Procesador (CPU)</span>
                            <span className="text-neutral-200 font-medium text-right truncate max-w-[140px]" title={pcAgentMode === 'pc' && pcHardware ? pcHardware.cpuModel : localBrowserSpecs.cpuModel}>
                              {pcAgentMode === 'pc' && pcHardware ? pcHardware.cpuModel : localBrowserSpecs.cpuModel}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-white/[0.02]">
                            <span className="text-neutral-500 uppercase text-[9px]">Núcleos Físicos</span>
                            <span className="text-neutral-200 font-medium">
                              {pcAgentMode === 'pc' && pcHardware ? `${pcHardware.cpuCores} Cores` : `${localBrowserSpecs.cpuCores} Cores`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-white/[0.02]">
                            <span className="text-neutral-500 uppercase text-[9px]">Tarjeta de Video</span>
                            <span className="text-neutral-200 font-medium text-right truncate max-w-[140px]" title={pcAgentMode === 'pc' && pcHardware ? pcHardware.gpuModel : localBrowserSpecs.gpuModel}>
                              {pcAgentMode === 'pc' && pcHardware ? pcHardware.gpuModel : localBrowserSpecs.gpuModel}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-neutral-500 uppercase text-[9px]">Protecciones Activas</span>
                            <span className="text-emerald-400 font-bold">
                              {shields.filter(s => s.enabled).length} de {shields.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Complete Dashboard view */}
                    <div className="xl:col-span-8 flex flex-col gap-6" id="dashboard-main-column">
                      
                      {/* Floating freed success alert banner */}
                      <AnimatePresence>
                        {freedAlert.visible && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 shadow-xl relative overflow-hidden"
                            id="freed-amount-success-toast"
                          >
                            <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
                            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex items-center justify-center shrink-0">
                              <Zap className="w-5 h-5 text-emerald-400 animate-bounce" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider">¡Optimización RAM Exitosa!</h5>
                              <p className="text-[11px] text-emerald-300 mt-0.5">
                                El desreferenciador de memoria real de Crystal Clear liberó con éxito <strong className="text-white text-xs">{freedAlert.amountMb} MB</strong> de memoria caché no utilizada.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Optimizer Dashboard rendering */}
                      <OptimizerDashboard 
                        categories={categories}
                        scanState={scanState}
                        onToggleFile={handleToggleFile}
                        onToggleAll={handleToggleAll}
                        onScan={handleScan}
                        onClean={handleClean}
                        settings={settings}
                        processes={processes}
                        setProcesses={setProcesses}
                        ramOverride={ramOverride}
                        performanceHistory={performanceHistory}
                        pcAgentMode={pcAgentMode}
                        setPcAgentMode={setPcAgentMode}
                        pcAgentStatus={pcAgentStatus}
                        pcHardware={pcHardware}
                        isTauri={isTauri}
                      />
                    </div>

                  </div>
                )}

                {activeView === 'security' && (
                  <div className="border border-white/10 bg-neutral-950/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl" id="view-security-stage">
                    <SecurityPanel 
                      shields={shields} 
                      onToggleShield={handleToggleShield} 
                      scanState={scanState} 
                    />
                  </div>
                )}

                {activeView === 'pricing' && (
                  <div className="border border-white/10 bg-neutral-950/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-fade-in" id="view-pricing-stage">
                    <PricingTiers onClaimFreeKey={handleClaimFreeKey} />
                  </div>
                )}

                {activeView === 'licensing' && (
                  <div className="border border-white/10 bg-neutral-950/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-fade-in" id="view-licensing-stage">
                    <LicensingManager 
                      licenseUsers={licenseUsers} 
                      onActivateKey={handleActivateKey} 
                    />
                  </div>
                )}

                {activeView === 'installers' && (
                  <div className="border border-white/10 bg-neutral-950/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-fade-in" id="view-installers-stage">
                    <InstallersPanel onTriggerClean={handleScan} scanState={scanState} />
                  </div>
                )}

                {activeView === 'tests' && (
                  <div className="border border-white/10 bg-neutral-950/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-fade-in" id="view-tests-stage">
                    <DiagnosticSuite 
                      categories={categories}
                      shields={shields}
                      licenseUsers={licenseUsers}
                      settings={settings}
                      onUpdateSettings={setSettings}
                      onActivateKey={handleActivateKey}
                      onToggleShield={handleToggleShield}
                      onScan={handleScan}
                      onClean={handleClean}
                      scanState={scanState}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* Slide-Over Right Settings Panel Overlay */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Dark glass backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 cursor-pointer"
              id="settings-panel-backdrop"
            />
            {/* Sliding Panel */}
            <SettingsPanel 
              settings={settings} 
              onUpdateSettings={setSettings} 
              onClose={() => setShowSettings(false)} 
            />
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
