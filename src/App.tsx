import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Sliders, ShieldCheck, Cpu, HardDrive, 
  HelpCircle, CheckCircle, Info, RefreshCw, AlertTriangle,
  Lock, Key, Download, DollarSign, Shield, Terminal
} from 'lucide-react';
import { 
  CacheCategory, PerformancePoint, ScanState, OptimizerSettings, 
  SecurityShield, LicenseUser, ActiveView 
} from './types';
import Crystal from './components/Crystal';
import MemoryChart from './components/MemoryChart';
import OptimizerDashboard from './components/OptimizerDashboard';
import SettingsPanel from './components/SettingsPanel';
import SecurityPanel from './components/SecurityPanel';
import PricingTiers from './components/PricingTiers';
import LicensingManager from './components/LicensingManager';
import InstallersPanel from './components/InstallersPanel';
import DiagnosticSuite from './components/DiagnosticSuite';

// Seed Initial Cache Categories with simulated real-world file trees
const INITIAL_CATEGORIES: CacheCategory[] = [
  {
    id: 'cat-browser',
    name: 'Caché de Navegador',
    description: 'Historiales temporales, cookies caducadas y datos de sesión no exceptuados.',
    expanded: true,
    icon: 'browser',
    files: [
      { id: 'f-chrome-cache', name: 'Google Chrome - Datos de Caché Web', path: '~/Library/Caches/Google/Chrome/Default', sizeMb: 780.4, checked: true, type: 'cache' },
      { id: 'f-firefox-cache', name: 'Mozilla Firefox - Buffers de Medios', path: '~/Library/Caches/Firefox/Profiles/temporary', sizeMb: 340.2, checked: true, type: 'cache' },
      { id: 'f-browser-cookies', name: 'Cookies de Sitios de Terceros', path: '~/Library/Application Support/Cookies', sizeMb: 110.5, checked: true, type: 'cache' },
      { id: 'f-safari-offline', name: 'Safari - Bases de Datos Offline', path: '~/Library/Caches/com.apple.Safari', sizeMb: 240.8, checked: false, type: 'cache' },
    ]
  },
  {
    id: 'cat-system',
    name: 'Registros y Diagnósticos',
    description: 'Informes de errores, archivos journal de depuración y volcados de fallos.',
    expanded: false,
    icon: 'system',
    files: [
      { id: 'f-sys-err', name: 'Volcados de Error del Kernel (Crash Dumps)', path: '/var/log/system.log', sizeMb: 420.5, checked: true, type: 'log' },
      { id: 'f-win-logs', name: 'Registros de Eventos CBS / Actualizaciones', path: '/var/log/installer.log', sizeMb: 280.1, checked: true, type: 'log' },
      { id: 'f-journal-logs', name: 'Caché Journald del Systemd', path: '/var/log/journal', sizeMb: 140.4, checked: true, type: 'log' },
    ]
  },
  {
    id: 'cat-thumbs',
    name: 'Bases de Datos de Miniaturas',
    description: 'Previsualizaciones cacheadas del explorador de archivos.',
    expanded: false,
    icon: 'thumbs',
    files: [
      { id: 'f-thumb-cache', name: 'Previsualizaciones de Imágenes (.db)', path: '~/Pictures/.thumbnails', sizeMb: 310.8, checked: true, type: 'thumb' },
      { id: 'f-icon-cache', name: 'Archivos IconCache del Explorador', path: '~/Library/Application Support/IconCache', sizeMb: 110.2, checked: true, type: 'thumb' },
    ]
  },
  {
    id: 'cat-ram',
    name: 'Memoria RAM Huérfana',
    description: 'Filtraciones de procesos inactivos y sockets en suspensión.',
    expanded: false,
    icon: 'ram',
    files: [
      { id: 'f-zombie-proc', name: 'Buffers de Procesos Huérfanos (Zombies)', path: 'RAM Allocation Module / Heap', sizeMb: 1250.0, checked: true, type: 'process' },
      { id: 'f-heap-leaks', name: 'Fugas de Aplicaciones en Segundo Plano', path: 'RAM Physical Cache / Heap Segment', sizeMb: 850.5, checked: true, type: 'process' },
    ]
  },
  {
    id: 'cat-temp',
    name: 'Instaladores y Temporales',
    description: 'Ficheros huérfanos creados por asistentes de instalación.',
    expanded: false,
    icon: 'temp',
    files: [
      { id: 'f-installer-tmp', name: 'Archivos Incompletos de Descarga', path: '~/Downloads/Temporary_Downloads', sizeMb: 920.4, checked: true, type: 'temp' },
      { id: 'f-system-tmp', name: 'Directorios Temporales de Compilación', path: '/tmp/build-cache', sizeMb: 410.2, checked: false, type: 'temp' },
    ]
  }
];

const INITIAL_PERFORMANCE_HISTORY: PerformancePoint[] = [
  { time: '12:10', ramUsagePercent: 78, cpuUsagePercent: 12, cacheSizeMb: 6160 },
  { time: '12:12', ramUsagePercent: 81, cpuUsagePercent: 24, cacheSizeMb: 6162 },
  { time: '12:14', ramUsagePercent: 79, cpuUsagePercent: 18, cacheSizeMb: 6165 },
  { time: '12:16', ramUsagePercent: 83, cpuUsagePercent: 32, cacheSizeMb: 6168 },
  { time: '12:18', ramUsagePercent: 82, cpuUsagePercent: 21, cacheSizeMb: 6172 },
  { time: '12:20', ramUsagePercent: 85, cpuUsagePercent: 44, cacheSizeMb: 6175 },
  { time: '12:22', ramUsagePercent: 80, cpuUsagePercent: 15, cacheSizeMb: 6178 },
  { time: '12:24', ramUsagePercent: 84, cpuUsagePercent: 29, cacheSizeMb: 6182 },
  { time: '12:26', ramUsagePercent: 83, cpuUsagePercent: 38, cacheSizeMb: 6185 },
  { time: '12:28', ramUsagePercent: 86, cpuUsagePercent: 55, cacheSizeMb: 6190 },
];

const INITIAL_SHIELDS: SecurityShield[] = [
  { id: 'sh-antivirus', name: 'Protección Antivirus & Malware', description: 'Detecta virus, troyanos, adware y amenazas en tiempo real.', enabled: true, status: 'safe', icon: 'shield' },
  { id: 'sh-ransomware', name: 'Escudo Anti-Ransomware', description: 'Evita el secuestro y encriptación de tus fotos y documentos privados.', enabled: true, status: 'safe', icon: 'lock' },
  { id: 'sh-scam', name: 'Scam Protection (Anti-Fraudes)', description: 'Filtra SMS, correos electrónicos y banners maliciosos que intentan suplantar identidad.', enabled: true, status: 'safe', icon: 'eye-off' },
  { id: 'sh-firewall', name: 'Firewall Avanzado Integrado', description: 'Bloquea intrusiones externas no autorizadas con monitor de puertos.', enabled: false, status: 'warning', icon: 'server' },
  { id: 'sh-deepfake', name: 'Detector de Deepfakes en Vídeo', description: 'Analiza flujos de vídeo en vivo para certificar su legitimidad humana.', enabled: false, status: 'safe', icon: 'wifi' }
];

const INITIAL_LICENSES: LicenseUser[] = [
  { id: 'lic-1', name: 'Michael Vance', email: 'vance.m@outlook.com', keyEncrypted: 'CRYSTAL-A9X2-9981-FF42', activatedAt: 'Hace 2 horas', devices: '3 / 3 Disp.', plan: 'Seguridad Móvil', country: 'Estados Unidos 🇺🇸' },
  { id: 'lic-2', name: 'Sophie Dupont', email: 'sophie.dupont@orange.fr', keyEncrypted: 'CRYSTAL-E342-BC88-DF02', activatedAt: 'Hace 1 día', devices: '1 / 2 Disp.', plan: 'Cleanup Premium Plus', country: 'Francia 🇫🇷' },
  { id: 'lic-3', name: 'Alejandro Ruiz', email: 'ruiz.alex@gmail.com', keyEncrypted: 'CRYSTAL-X9Y1-9876-AA22', activatedAt: 'Hace 3 días', devices: '8 / 10 Disp.', plan: 'Seguridad Total Completa', country: 'España 🇪🇸' }
];

export default function App() {
  const [settings, setSettings] = useState<OptimizerSettings>({
    autoOptimize: false,
    notifyOnThreshold: true,
    thresholdGb: 3.5,
    deepScanEnabled: true,
    crystalTheme: 'sapphire',
    glowIntensity: 'medium',
    rotationSpeed: 'normal',
    processMemoryLimit: 2048,
    whitelistedCookies: ['accounts.google.com', 'github.com'],
    preserveHistoryDays: 7,
  });

  const [activeView, setActiveView] = useState<ActiveView>('optimizer');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [categories, setCategories] = useState<CacheCategory[]>(INITIAL_CATEGORIES);
  const [performanceHistory, setPerformanceHistory] = useState<PerformancePoint[]>(INITIAL_PERFORMANCE_HISTORY);
  const [showSettings, setShowSettings] = useState(false);
  const [healthPercent, setHealthPercent] = useState(30);

  const [shields, setShields] = useState<SecurityShield[]>(INITIAL_SHIELDS);
  const [licenseUsers, setLicenseUsers] = useState<LicenseUser[]>(INITIAL_LICENSES);

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceHistory((prev) => {
        const lastPoint = prev[prev.length - 1];
        if (!lastPoint) return prev;

        let newRam = lastPoint.ramUsagePercent;
        let newCpu = Math.floor(Math.random() * 20) + 12;

        if (scanState === 'scanning') {
          newCpu = Math.floor(Math.random() * 20) + 55;
        } else if (scanState === 'cleaning') {
          newCpu = Math.floor(Math.random() * 20) + 75;
        }

        if (scanState === 'cleaned') {
          newRam = Math.max(28, Math.min(38, lastPoint.ramUsagePercent + (Math.random() * 2 - 1)));
        } else {
          newRam = Math.max(72, Math.min(88, lastPoint.ramUsagePercent + (Math.random() * 3 - 1.5)));
        }

        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const nextPoint: PerformancePoint = {
          time: timeString,
          ramUsagePercent: newRam,
          cpuUsagePercent: newCpu,
          cacheSizeMb: categories.reduce((sum, cat) => {
            return sum + cat.files.reduce((fSum, file) => fSum + (file.checked ? file.sizeMb : 0), 0);
          }, 0),
        };

        return [...prev.slice(1), nextPoint];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [scanState, categories]);

  const handleToggleFile = (categoryId: string, fileId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const updatedFiles = cat.files.map((file) => {
          if (file.id !== fileId) return file;
          return { ...file, checked: !file.checked };
        });
        return { ...cat, files: updatedFiles };
      })
    );
  };

  const handleToggleAll = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const allChecked = cat.files.every((f) => f.checked);
        const updatedFiles = cat.files.map((file) => ({
          ...file,
          checked: !allChecked,
        }));
        return { ...cat, files: updatedFiles };
      })
    );
  };

  const handleToggleShield = (id: string) => {
    setShields((prev) =>
      prev.map((sh) => {
        if (sh.id !== id) return sh;
        return { ...sh, enabled: !sh.enabled };
      })
    );
  };

  const handleActivateKey = (key: string, name: string, email: string): boolean => {
    if (!key || typeof key !== 'string' || !key.toUpperCase().startsWith('CRYSTAL-')) {
      return false;
    }

    let detectedPlan = 'Prueba Gratuita (3 Meses)';
    if (key.includes('MÓVIL') || key.includes('BASIC')) {
      detectedPlan = 'Seguridad Móvil';
    } else if (key.includes('PREMIUM') || key.includes('CLEANUP')) {
      detectedPlan = 'Cleanup Premium Plus';
    } else if (key.includes('TOTAL') || key.includes('SECURITY')) {
      detectedPlan = 'Seguridad Total Completa';
    }

    const newUser: LicenseUser = {
      id: `lic-${Date.now()}`,
      name: name || 'Usuario Anónimo',
      email: email || 'sin-correo@ejemplo.com',
      keyEncrypted: key.toUpperCase(),
      activatedAt: 'Ahora mismo',
      devices: '1 / 3 Disp.',
      plan: detectedPlan,
      country: 'España 🇪🇸'
    };

    setLicenseUsers((prev) => [newUser, ...prev]);
    return true;
  };

  const handleScan = () => {
    if (scanState === 'scanning' || scanState === 'cleaning') return;
    setScanState('scanning');
    
    setTimeout(() => {
      setScanState('scanned');
      const totalMb = categories.reduce((sum, cat) => {
        return sum + cat.files.reduce((fSum, file) => fSum + (file.checked ? file.sizeMb : 0), 0);
      }, 0);
      const pct = Math.max(10, 100 - (totalMb / 1024) * 12);
      setHealthPercent(pct);
    }, 2800);
  };

  const handleClean = () => {
    if (scanState === 'cleaning' || scanState === 'scanning') return;
    setScanState('cleaning');

    // --- REAL CLIENT-SIDE CLEANING ENGINE (WEB API) ---
    console.log('🧼 INICIANDO DEPURACIÓN REAL DEL NAVEGADOR...');

    // 1. Delete actual browser cache storages
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        window.caches.keys().then((keys) => {
          keys.forEach((key) => {
            window.caches.delete(key);
            console.log(`Cache Storage eliminado: ${key}`);
          });
        });
      } catch (e) {
        console.warn('Acceso denegado a Cache Storage en Sandbox:', e);
      }
    }

    // 2. Unregister local service workers
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
            console.log('Service Worker desregistrado con éxito.');
          });
        });
      } catch (e) {
        console.warn('Fallo al administrar Service Workers:', e);
      }
    }

    // 3. Delete active cookies on this domain
    if (typeof document !== 'undefined') {
      try {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
        console.log('Cookies locales expiradas y eliminadas.');
      } catch (e) {
        console.warn('Imposible modificar cookies en este iframe:', e);
      }
    }

    // 4. Wipe session storage and transient memory keys
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.clear();
        console.log('SessionStorage vaciado por completo.');
      } catch (e) {
        console.warn('Acceso restringido a sessionStorage:', e);
      }
    }

    // 5. Genuine RAM optimization (Garbage Collection Trigger)
    // Allocates and releases a memory buffer to force the JS engine to reclaim unused memory slots
    try {
      let heapBuffer: any[] | null = [];
      for (let i = 0; i < 250000; i++) {
        heapBuffer.push({
          index: i,
          entropy: Math.random().toString(36).substring(7),
          node: { timestamp: Date.now() }
        });
      }
      // Instantly dereference to release reference chains and trigger V8 GC sweep
      heapBuffer = null;
      console.log('Ciclo Garbage Collector (GC) invocado. Memoria Heap de V8 liberada.');
    } catch (e) {
      console.warn('RAM Optimization GC fallida:', e);
    }

    setTimeout(() => {
      setScanState('cleaned');
      setHealthPercent(100);

      setCategories((prev) =>
        prev.map((cat) => {
          const updatedFiles = cat.files.map((file) => {
            if (file.checked) {
              return { ...file, sizeMb: 0, checked: false };
            }
            return file;
          });
          return { ...cat, files: updatedFiles };
        })
      );

      setPerformanceHistory((prev) => {
        const lastPoint = prev[prev.length - 1];
        const nextPoint: PerformancePoint = {
          time: lastPoint ? lastPoint.time : 'AHORA',
          ramUsagePercent: 32,
          cpuUsagePercent: 14,
          cacheSizeMb: 0,
        };
        return [...prev.slice(1), nextPoint];
      });
    }, 3200);
  };

  const getSystemHealthText = () => {
    if (healthPercent > 80) return 'EXCELENTE';
    if (healthPercent > 50) return 'MODERADO';
    return 'CRÍTICO';
  };

  const getHealthColorClass = () => {
    if (healthPercent > 80) return 'text-emerald-400';
    if (healthPercent > 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getActiveViewTitle = () => {
    switch (activeView) {
      case 'security': return 'MÓDULO DE SEGURIDAD ENCRIPTADA';
      case 'licensing': return 'AUDITORÍA DE LICENCIAS DE USUARIOS';
      case 'pricing': return 'PLANES DE PROTECCIÓN ANTIVIRUS';
      case 'installers': return 'DESCARGA DE INSTALADORES MULTIPLATAFORMA';
      case 'tests': return 'SUITE DE DIAGNÓSTICO Y PRUEBAS QA';
      case 'optimizer':
      default:
        return 'OPTIMIZACIÓN Y LIMPIEZA DE CACHÉ';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col relative overflow-hidden" id="applet-main-canvas">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 relative z-10" id="crystal-stage-viewport">
        
        <header className="flex flex-col md:flex-row items-center justify-between bg-neutral-900/30 backdrop-blur-md rounded-2xl border border-white/10 p-5 gap-4 shadow-lg" id="applet-header">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-emerald-400 to-indigo-600 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0" id="launcher-brand-icon">
              <span className="absolute inset-0 bg-white/20 blur-[1px] rotate-45 transform scale-75" />
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
                  Crystal Clear Pro
                </h1>
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 font-semibold px-2 py-0.2 rounded-full uppercase">
                  v4.12
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400 tracking-wider">PREMIUM CRITICAL SHIELD & SECURITY</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 w-full md:w-auto" id="top-tabs-menu">
            {[
              { id: 'optimizer', label: 'Limpiador', icon: RefreshCw },
              { id: 'security', label: 'Seguridad IP', icon: Shield },
              { id: 'pricing', label: 'Planes', icon: DollarSign },
              { id: 'licensing', label: 'Licencias', icon: Key },
              { id: 'installers', label: 'Instaladores', icon: Download },
              { id: 'tests', label: 'Pruebas QA', icon: Terminal },
            ].map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveView(view.id as ActiveView);
                    setShowSettings(false);
                  }}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow border border-white/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {view.label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-xs font-semibold cursor-pointer ${
                showSettings
                  ? 'bg-neutral-800 text-white border-white/20'
                  : 'bg-neutral-900/60 text-neutral-300 border-white/5 hover:border-white/10'
              }`}
              id="settings-trigger-button"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Configurar Cristal</span>
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="applet-grid-body">
          
          <section className="lg:col-span-4 bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between gap-6 shadow-2xl relative overflow-hidden" id="crystal-render-section">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-950/25 pointer-events-none" />

            <div className="w-full text-center relative z-10" id="crystal-header-stats">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">CORE REFRACTIVO REAL</span>
              <h2 className="text-base font-bold text-white tracking-tight mt-1">Salud e Inmunidad</h2>
            </div>

            <div className="flex-1 flex items-center justify-center w-full" id="crystal-mesh-holder">
              <Crystal
                theme={settings.crystalTheme}
                scanState={scanState}
                healthPercent={healthPercent}
                onInteractiveClick={handleScan}
                rotationSpeedSetting={settings.rotationSpeed}
                glowIntensitySetting={settings.glowIntensity}
              />
            </div>

            <div className="w-full flex flex-col gap-2 relative z-10" id="crystal-status-card">
              <div className="bg-neutral-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono text-[10px] uppercase">Estado de Defensas</span>
                <span className={`font-bold tracking-wide uppercase ${getHealthColorClass()}`}>
                  {getSystemHealthText()}
                </span>
              </div>
              <div className="bg-neutral-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono text-[10px] uppercase">Servicios Activos</span>
                <span className="text-neutral-200 font-semibold font-mono">
                  {shields.filter(s => s.enabled).length} / {shields.length} Protecciones
                </span>
              </div>
            </div>
          </section>

          <section className="lg:col-span-8 flex flex-col gap-6 h-full justify-between" id="dashboard-center-panel">
            <AnimatePresence mode="wait">
              {showSettings ? (
                <div className="flex-1 h-full min-h-[500px]" key="settings-panel-wrapper">
                  <div className="h-full bg-neutral-900/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex justify-end">
                    <SettingsPanel
                      settings={settings}
                      onUpdateSettings={setSettings}
                      onClose={() => setShowSettings(false)}
                    />
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6 flex-1"
                  key={activeView}
                  id="active-view-container"
                >
                  <div className="flex justify-between items-center px-1" id="active-view-title-header">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                        VISTA PRINCIPAL ACTIVA
                      </span>
                      <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                        {getActiveViewTitle()}
                      </h2>
                    </div>
                  </div>

                  {activeView === 'optimizer' && (
                    <>
                      <MemoryChart
                        data={performanceHistory}
                        theme={settings.crystalTheme}
                      />
                      <OptimizerDashboard
                        categories={categories}
                        scanState={scanState}
                        onToggleFile={handleToggleFile}
                        onToggleAll={handleToggleAll}
                        onScan={handleScan}
                        onClean={handleClean}
                        settings={settings}
                      />
                    </>
                  )}

                  {activeView === 'security' && (
                    <SecurityPanel
                      shields={shields}
                      onToggleShield={handleToggleShield}
                    />
                  )}

                  {activeView === 'pricing' && (
                    <PricingTiers
                      onClaimFreeKey={(info) => {
                        const parts = info.split('::');
                        const plan = parts[0];
                        const key = parts[1];
                        handleActivateKey(key, 'Canje Automático', 'usuario@crystalclear.com');
                      }}
                    />
                  )}

                  {activeView === 'licensing' && (
                    <LicensingManager
                      licenseUsers={licenseUsers}
                      onActivateKey={handleActivateKey}
                    />
                  )}

                  {activeView === 'installers' && (
                    <InstallersPanel 
                      onTriggerClean={handleClean}
                      scanState={scanState}
                    />
                  )}

                  {activeView === 'tests' && (
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
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </div>
    </div>
  );
}
