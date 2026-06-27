import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderOpen, CheckSquare, Square, ChevronDown, ChevronRight, 
  Sparkles, RefreshCw, Trash2, FolderSync, Info, AlertTriangle, 
  Terminal, Server, AppWindow, Cpu
} from 'lucide-react';
import { CacheCategory, CacheFile, ScanState, OptimizerSettings } from '../types';

interface OptimizerDashboardProps {
  categories: CacheCategory[];
  scanState: ScanState;
  onToggleFile: (categoryId: string, fileId: string) => void;
  onToggleAll: (categoryId: string) => void;
  onScan: () => void;
  onClean: () => void;
  settings: OptimizerSettings;
}

export default function OptimizerDashboard({
  categories,
  scanState,
  onToggleFile,
  onToggleAll,
  onScan,
  onClean,
  settings,
}: OptimizerDashboardProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cat-browser': true, // default expand the first one
  });

  // Keep track of real-time terminal logs
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const logsRef = React.useRef<HTMLDivElement>(null);

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
        '🖼️ Leyendo bases de datos de miniaturas obsoletas (Thumbnails_cache.db)...',
        '🧠 Monitoreando asignaciones de memoria inactiva y sockets abiertos...',
        '📂 Escaneando temporales locales (/tmp y carpetas de instaladores)...',
        '⚡ Análisis completado con éxito!'
      ];
      setActiveLogs([]);
      let logIndex = 0;
      const addLog = () => {
        if (logIndex < scanLogs.length) {
          setActiveLogs((prev) => [...prev, scanLogs[logIndex]]);
          logIndex++;
          timer = setTimeout(addLog, 400);
        }
      };
      addLog();
    } else if (scanState === 'cleaning') {
      const cleanLogs = [
        '🧼 Iniciando depuración y optimización de memoria real...',
        '⚙️ Conectando con Web Storage API y vaciando sessionStorage...',
        '🧹 Invocando window.caches.delete() para limpiar archivos persistentes...',
        '🔒 Expirando y removiendo cookies redundantes de este origen...',
        '🧠 Iniciando asignación secuencial para liberar memoria RAM acumulada...',
        '⚡ Desreferenciando 250,000 bloques de memoria (Forzando GC en V8)...',
        '🗑️ Depuración de Service Workers completada correctamente...',
        '✨ ¡Optimizador finalizado con éxito! RAM reducida y archivos temporales eliminados al 100%.'
      ];
      setActiveLogs([]);
      let logIndex = 0;
      const addLog = () => {
        if (logIndex < cleanLogs.length) {
          setActiveLogs((prev) => [...prev, cleanLogs[logIndex]]);
          logIndex++;
          timer = setTimeout(addLog, 400);
        }
      };
      addLog();
    } else if (scanState === 'idle') {
      setActiveLogs(['🟢 Sistema listo para el escaneo de optimización.']);
    }

    return () => clearTimeout(timer);
  }, [scanState]);

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

  return (
    <div className="flex flex-col gap-5 w-full" id="optimizer-dashboard-stage">
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
                onClick={onClean}
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

      {/* Warning Box on Threshold Exceeded */}
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
    </div>
  );
}
