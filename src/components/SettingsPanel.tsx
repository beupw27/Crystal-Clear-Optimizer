import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sliders, ShieldCheck, Clock, Check, Plus, Trash2, HelpCircle } from 'lucide-react';
import { OptimizerSettings, CrystalTheme } from '../types';

interface SettingsPanelProps {
  settings: OptimizerSettings;
  onUpdateSettings: (newSettings: OptimizerSettings) => void;
  onClose: () => void;
}

type TabType = 'visuals' | 'rules' | 'whitelist';

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  onClose,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('visuals');
  const [newCookie, setNewCookie] = useState('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const updateSetting = <K extends keyof OptimizerSettings>(key: K, value: OptimizerSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleAddCookie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCookie.trim()) return;
    
    // Prevent duplicate whitelists
    if (!settings.whitelistedCookies.includes(newCookie.trim().toLowerCase())) {
      updateSetting('whitelistedCookies', [...settings.whitelistedCookies, newCookie.trim().toLowerCase()]);
    }
    setNewCookie('');
  };

  const handleRemoveCookie = (cookie: string) => {
    updateSetting(
      'whitelistedCookies',
      settings.whitelistedCookies.filter((c) => c !== cookie)
    );
  };

  // Preset domains to easily whitelist
  const standardPresets = ['accounts.google.com', 'github.com', 'notion.so', 'spotify.com'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full lg:w-[420px] bg-neutral-950/95 border-l border-white/10 p-6 flex flex-col h-full overflow-y-auto relative z-30"
      id="settings-overlay-panel"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5" id="settings-header-container">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">Panel de Configuración</h2>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Cerrar configuraciones"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-neutral-900/80 rounded-xl mb-6 border border-white/5" id="settings-tabs-row">
        {[
          { id: 'visuals', label: 'Cristal', icon: Sliders },
          { id: 'rules', label: 'Políticas', icon: Clock },
          { id: 'whitelist', label: 'Exclusiones', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-md border border-white/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 flex flex-col gap-6" id="settings-tab-content-area">
        {activeTab === 'visuals' && (
          <div className="flex flex-col gap-5" id="settings-visuals-tab">
            {/* Theme Select */}
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-2">TEMA DEL CRISTAL</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'sapphire', name: 'Zafiro', color: 'bg-blue-500' },
                  { id: 'emerald', name: 'Esmeralda', color: 'bg-emerald-500' },
                  { id: 'amber', name: 'Ámbar', color: 'bg-amber-500' },
                  { id: 'quartz', name: 'Cuarzo', color: 'bg-pink-500' },
                  { id: 'obsidian', name: 'Obsidiana', color: 'bg-indigo-900' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => updateSetting('crystalTheme', th.id as CrystalTheme)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      settings.crystalTheme === th.id
                        ? 'bg-neutral-800/80 border-white/20 shadow-lg'
                        : 'bg-transparent border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg ${th.color} shadow-inner flex items-center justify-center`}>
                      {settings.crystalTheme === th.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    <span className="text-[9px] text-neutral-300 font-sans">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation Speed */}
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-2">VELOCIDAD DE ROTACIÓN</label>
              <div className="flex p-1 bg-neutral-900/60 rounded-xl border border-white/5">
                {[
                  { id: 'slow', label: 'Lenta' },
                  { id: 'normal', label: 'Normal' },
                  { id: 'fast', label: 'Rápida' },
                ].map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => updateSetting('rotationSpeed', sp.id as 'slow' | 'normal' | 'fast')}
                    className={`flex-1 text-center py-1.5 text-xs rounded-lg transition-all ${
                      settings.rotationSpeed === sp.id
                        ? 'bg-neutral-800 text-white font-medium border border-white/10'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Glow Intensity */}
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-2">INTENSIDAD DEL DESTELLO (GLOW)</label>
              <div className="flex p-1 bg-neutral-900/60 rounded-xl border border-white/5">
                {[
                  { id: 'low', label: 'Tenue' },
                  { id: 'medium', label: 'Medio' },
                  { id: 'high', label: 'Brillante' },
                ].map((gl) => (
                  <button
                    key={gl.id}
                    onClick={() => updateSetting('glowIntensity', gl.id as 'low' | 'medium' | 'high')}
                    className={`flex-1 text-center py-1.5 text-xs rounded-lg transition-all ${
                      settings.glowIntensity === gl.id
                        ? 'bg-neutral-800 text-white font-medium border border-white/10'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {gl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="flex flex-col gap-5" id="settings-rules-tab">
            {/* Threshold Settings */}
            <div className="bg-neutral-900/40 border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neutral-300">TOLERANCIA DE BASURA</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{settings.thresholdGb} GB</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={settings.thresholdGb}
                onChange={(e) => updateSetting('thresholdGb', parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-neutral-500 mt-2 font-sans">
                El cristal cambiará a tono de alerta ámbar/rojo si el tamaño acumulado del caché supera este umbral.
              </p>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-neutral-900/40 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-200">Auto-Optimizar en Caliente</span>
                  <span className="text-[10px] text-neutral-400">Optimiza al rebasar el umbral</span>
                </div>
                <button
                  onClick={() => updateSetting('autoOptimize', !settings.autoOptimize)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${
                    settings.autoOptimize ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full transition-all block ${
                    settings.autoOptimize ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-neutral-900/40 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-200">Notificaciones de Umbral</span>
                  <span className="text-[10px] text-neutral-400">Emite una alerta al rebasar límite</span>
                </div>
                <button
                  onClick={() => updateSetting('notifyOnThreshold', !settings.notifyOnThreshold)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${
                    settings.notifyOnThreshold ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full transition-all block ${
                    settings.notifyOnThreshold ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-neutral-900/40 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-200">Escanear en Profundidad (Deep Scan)</span>
                  <span className="text-[10px] text-neutral-400">Escudriña ficheros duplicados ocultos</span>
                </div>
                <button
                  onClick={() => updateSetting('deepScanEnabled', !settings.deepScanEnabled)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${
                    settings.deepScanEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full transition-all block ${
                    settings.deepScanEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Exclude Logs Duration */}
            <div className="bg-neutral-900/40 border border-white/5 p-4 rounded-xl">
              <label className="text-xs font-mono text-neutral-400 block mb-2">CONSERVACIÓN DE ARCHIVOS RECIENTES</label>
              <div className="flex items-center gap-2">
                <select
                  value={settings.preserveHistoryDays}
                  onChange={(e) => updateSetting('preserveHistoryDays', parseInt(e.target.value))}
                  className="bg-neutral-800 text-xs text-neutral-200 rounded-lg border border-white/10 p-2 flex-1 focus:outline-none focus:border-emerald-500"
                >
                  <option value={0}>Borrar todo sin excepción</option>
                  <option value={3}>Preservar últimos 3 días</option>
                  <option value={7}>Preservar última semana (Recomendado)</option>
                  <option value={15}>Preservar últimos 15 días</option>
                </select>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2">
                Evita la depuración de cookies e historiales creados de forma reciente para no entorpecer navegaciones cotidianas.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'whitelist' && (
          <div className="flex flex-col gap-4" id="settings-whitelist-tab">
            <p className="text-xs text-neutral-400 leading-relaxed">
              Whitelisting evita la eliminación accidental de cookies de sesión sensibles, asegurando que tus cuentas permanezcan abiertas al limpiar el caché del navegador.
            </p>

            {/* Add New Whitelisted Domain Form */}
            <form onSubmit={handleAddCookie} className="flex gap-2" id="whitelist-add-form">
              <input
                type="text"
                placeholder="ej: accounts.google.com"
                value={newCookie}
                onChange={(e) => setNewCookie(e.target.value)}
                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3 py-2 text-xs flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* List of Whitelisted domains */}
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1" id="whitelisted-items-list">
              {settings.whitelistedCookies.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-xs border border-dashed border-white/10 rounded-xl">
                  No hay exclusiones añadidas.
                </div>
              ) : (
                settings.whitelistedCookies.map((cookie) => (
                  <div
                    key={cookie}
                    className="flex justify-between items-center bg-neutral-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-neutral-200">{cookie}</span>
                    <button
                      onClick={() => handleRemoveCookie(cookie)}
                      className="text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Presets suggestions section */}
            <div className="mt-2 border-t border-white/10 pt-4" id="whitelist-presets-section">
              <span className="text-[10px] font-mono text-neutral-400 block mb-2 uppercase">Añadir exclusiones rápidas</span>
              <div className="flex flex-wrap gap-1.5">
                {standardPresets
                  .filter((p) => !settings.whitelistedCookies.includes(p))
                  .map((preset) => (
                    <button
                      key={preset}
                      onClick={() => updateSetting('whitelistedCookies', [...settings.whitelistedCookies, preset])}
                      className="bg-neutral-900/50 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5 text-neutral-500" />
                      {preset}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Status Label */}
      <div className="border-t border-white/10 pt-4 mt-6 flex justify-between text-[10px] font-mono text-neutral-500 uppercase" id="settings-panel-footer">
        <span>Estado de Política</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Activo y Seguro
        </span>
      </div>
    </motion.div>
  );
}
