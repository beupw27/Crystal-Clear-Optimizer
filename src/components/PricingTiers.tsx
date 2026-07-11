import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, Shield, HelpCircle, Sparkles, CreditCard, 
  ArrowRight, ShieldAlert, BadgeCheck, Copy, CheckCircle 
} from 'lucide-react';

interface PricingTiersProps {
  onClaimFreeKey: (info: string) => void;
}

export default function PricingTiers({ onClaimFreeKey }: PricingTiersProps) {
  const [claimedKey, setClaimedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'lite' | 'cleanup' | 'total'>('cleanup');

  const handleClaimFree = () => {
    // Generate a random crystal free trial key
    const hex = Array.from({ length: 8 }, () => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    ).join('');
    const randomKey = `CRYSTAL-FREE-3M-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
    setClaimedKey(randomKey);
    onClaimFreeKey(`Prueba Gratuita 3 Meses::${randomKey}`);
  };

  const handleCopyKey = () => {
    if (!claimedKey) return;
    navigator.clipboard.writeText(claimedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PLANS = [
    {
      id: 'lite',
      tag: 'Básico',
      title: 'PC Cleanup Lite',
      subtitle: 'Eliminación básica de archivos basura y limpieza de caché del navegador.',
      originalPrice: '$29.99',
      currentPrice: '$12.99',
      savingText: 'Ahorre 56%',
      billingText: 'Pago Único - De por Vida',
      devices: '1 PC / Windows 11',
      features: [
        'Elimina archivos temporales acumulados',
        'Purga de caché de navegadores principales',
        'Liberación estándar de memoria RAM',
        'Mejora de arranque rápido de Windows',
        'Garantía de devolución de 30 días'
      ],
      ctaText: 'Comprar por $12.99',
      keySample: 'CRYSTAL-LITE'
    },
    {
      id: 'cleanup',
      tag: '🔥 ¡SÚPER OFERTA LANZAMIENTO!',
      title: 'Crystal Pro: Todo Incluido',
      subtitle: 'Acceso total sin límites a la suite definitiva de optimización y seguridad.',
      originalPrice: '$89.99',
      currentPrice: '$19.99',
      savingText: 'Ahorre 78%',
      billingText: 'Sin mensualidades - Un Solo Pago',
      devices: '1 PC (Windows 11) + 1 Móvil Gratis',
      features: [
        '🚀 Real Booster Ultra (Priorización de CPU)',
        '🎮 GPU Shader & VRAM Textures Purger',
        '🛡️ IP Encriptada y Auditoría de Red Wi-Fi',
        '🧹 Cleanup Premium Plus completo',
        '🧠 Desreferenciación forzada de RAM inactiva',
        '✨ Soporte prioritario y actualizaciones gratis'
      ],
      ctaText: 'Adquirir Todo Incluido por $19.99',
      keySample: 'CRYSTAL-PRO-ALL-INCLUSIVE'
    },
    {
      id: 'total',
      tag: 'Multi-Dispositivo',
      title: 'Total Ultimate Family',
      subtitle: 'Suite máxima con protección antivirus móvil y familiar.',
      originalPrice: '$99.99',
      currentPrice: '$34.99',
      savingText: 'Ahorre 65%',
      billingText: 'Un Solo Pago - De por Vida',
      devices: 'Hasta 5 Dispositivos (PC + Móvil)',
      features: [
        'Todo lo incluido en el plan Crystal Pro',
        'Seguridad móvil avanzada (Android & iOS)',
        'Scam Protection (Bloqueo de llamadas)',
        'Destructor permanente de archivos',
        'Webcam Shield anti-espionaje'
      ],
      ctaText: 'Adquirir Familiar por $34.99',
      keySample: 'CRYSTAL-ULTIMATE-FAMILY'
    }
  ];

  return (
    <div className="flex flex-col gap-6" id="pricing-tiers-root">
      
      {/* Badges/Trust Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center" id="trust-bar-grid">
        <div className="bg-neutral-900/40 p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-xs text-neutral-300 font-mono">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span>Made in the EU (Garantía de Privacidad)</span>
        </div>
        <div className="bg-neutral-900/40 p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-xs text-neutral-300 font-mono">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Centenas de Millones de Usuarios</span>
        </div>
        <div className="bg-neutral-900/40 p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-xs text-neutral-300 font-mono">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Garantía de Devolución de 30 días</span>
        </div>
      </div>

      {/* 3 MONTHS FREE SPECIAL PROMO */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900/50 to-indigo-950/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden" id="promo-banner-3m">
        <div className="absolute top-0 right-0 bg-emerald-500 text-neutral-950 text-[10px] uppercase font-bold py-1 px-4 rounded-bl-xl tracking-widest shadow-md">
          PROMO LIMITADA
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">PROGRAMA GRATUITO CRISTAL</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1">Suscripción Gratuita durante 3 Meses Completos</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Obtenga una clave cifrada de prueba premium por 3 meses para probar cualquiera de las suites. Sin requerir tarjetas de crédito ni compromisos.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <button
              onClick={handleClaimFree}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold text-xs tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Reclamar Código Gratuito</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Claimed Key Reveal Animation */}
        <AnimatePresence>
          {claimedKey && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-5 p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4"
              id="claimed-key-panel"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Clave Generada y Guardada Automáticamente</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Usa este código en el panel de Licencias para activar tu suscripción premium.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/50 px-3.5 py-2 rounded-lg border border-emerald-500/15 w-full md:w-auto justify-between">
                <span className="font-mono text-xs text-emerald-300 font-bold tracking-wider">{claimedKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 text-emerald-400 hover:text-white transition-all cursor-pointer ml-3"
                  title="Copiar Clave"
                >
                  {copied ? <CheckCircle className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Core Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="plans-grid">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as 'lite' | 'cleanup' | 'total')}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected 
                  ? 'bg-neutral-900 border-indigo-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                  : 'bg-neutral-900/30 border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                {/* Tag banner */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/25' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {plan.tag}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">
                    {plan.savingText}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white tracking-tight">{plan.title}</h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed min-h-[32px]">{plan.subtitle}</p>

                {/* Price Display */}
                <div className="my-4 pt-4 border-t border-white/5 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{plan.currentPrice}</span>
                  <span className="text-xs text-neutral-500 line-through font-mono">{plan.originalPrice}</span>
                  <span className="text-[10px] text-neutral-400 font-mono ml-auto">{plan.billingText}</span>
                </div>

                <div className="text-[10px] text-indigo-300 font-semibold mb-3 font-mono">
                  Cobertura: {plan.devices}
                </div>

                {/* Features List */}
                <ul className="space-y-2 mb-6 text-[11px] text-neutral-300 border-t border-white/5 pt-4">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchase button simulation */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimFreeKey(`${plan.title}::${plan.keySample}-${Math.floor(1000 + Math.random() * 9000)}`);
                  alert(`¡Simulación de Compra de ${plan.title} completada!\nSe ha activado su clave en el módulo de Licencias.`);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border border-indigo-500/30' 
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-white/10'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{plan.ctaText}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* STRATEGIC COMMERCE & MONETIZATION GUIDE */}
      <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 mt-4 relative overflow-hidden" id="commercial-strategy-guide">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Manual de Lanzamiento & Estrategia de Venta Rápida</h3>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Cómo monetizar "Crystal Clear Pro" con tu propia web</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-neutral-300 leading-relaxed">
          {/* Col 1: Pricing */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">1. Precios Recomendados</span>
            <p className="text-[11px] text-neutral-400">
              Para maximizar ventas rápidas, utiliza <strong>Precios Psicológicos</strong> acabados en 9:
            </p>
            <ul className="space-y-1.5 font-mono text-[10.5px] bg-black/40 p-2 rounded-lg text-neutral-200">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Cleanup Core:</span>
                <span className="text-emerald-300 font-bold">$19.99</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Real Booster Suite:</span>
                <span className="text-indigo-300 font-bold">$29.99</span>
              </li>
              <li className="flex justify-between text-amber-300 font-bold">
                <span>Total Sec + IP Encrypt:</span>
                <span>$44.99</span>
              </li>
            </ul>
            <p className="text-[10px] text-neutral-500 italic">
              * Ofrece siempre el "Total Security" como la opción más rentable (Efecto Señuelo).
            </p>
          </div>

          {/* Col 2: Marketing USPs */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">2. Puntos Fuertes de Venta (USP)</span>
            <p className="text-[11px] text-neutral-400">
              Tus argumentos clave de venta en la web de aterrizaje (Landing Page):
            </p>
            <ul className="space-y-1.5 text-[10.5px] text-neutral-300">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">🛡️ IP Encriptada:</span>
                <span>Evita ataques DDoS de raíz mediante túneles AES-256 en tiempo real.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">🚀 Real Booster:</span>
                <span>Optimización real de hilos V8 y recolector de basura sin ralentizaciones.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">🎮 GPU Shaders:</span>
                <span>Limpieza real de texturas y VRAM para ganar FPS en Windows 11.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Landing Page & Checkout */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">3. Plataforma y Cobros</span>
            <p className="text-[11px] text-neutral-400">
              Sigue estos pasos sencillos para empezar a recibir ingresos:
            </p>
            <ol className="space-y-1.5 text-[10.5px] list-decimal list-inside text-neutral-300">
              <li>
                <strong>Pasarela Simple:</strong> Regístrate en <em>LemonSqueezy</em> o <em>Stripe</em> para cobrar con tarjeta o PayPal sin complicar el backend.
              </li>
              <li>
                <strong>Landing Page:</strong> Usa esta misma interfaz o transpílala a HTML puro para lucir un diseño futurista premium.
              </li>
              <li>
                <strong>PWA & Distribución Web:</strong> Convierte esta SPA en una PWA (Progressive Web App) con soporte completo fuera de línea o empaquétala con Electron para su distribución nativa en computadoras.
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-4 p-3.5 bg-indigo-950/20 border border-indigo-500/10 rounded-xl flex items-center justify-between gap-4">
          <div className="text-[11px] text-indigo-200">
            <strong>¿Listo para exportar?</strong> El flujo de compilación automática está listo en GitHub Actions para generar la build estática de producción optimizada de React cada vez que actualices el repositorio.
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 shrink-0">
            React Listo
          </span>
        </div>
      </div>
    </div>
  );
}
