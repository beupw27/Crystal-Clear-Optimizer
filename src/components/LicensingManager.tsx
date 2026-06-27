import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, UserCheck, Shield, Search, CheckCircle2, 
  AlertTriangle, Filter, Globe, Server, Copy, Check,
  Plus, Coins, Terminal, Sliders, Download, Sparkles, Share2, Eye
} from 'lucide-react';
import { LicenseUser } from '../types';

interface LicensingManagerProps {
  licenseUsers: LicenseUser[];
  onActivateKey: (key: string, name: string, email: string) => boolean;
}

export default function LicensingManager({ licenseUsers, onActivateKey }: LicensingManagerProps) {
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  
  // Client States
  const [inputKey, setInputKey] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Admin States
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPlan, setAdminPlan] = useState<'MÓVIL' | 'CLEANUP' | 'TOTAL'>('TOTAL');
  const [adminCountry, setAdminCountry] = useState('España 🇪🇸');
  const [generatedKeyResult, setGeneratedKeyResult] = useState('');
  const [adminCopied, setAdminCopied] = useState(false);
  const [bulkQty, setBulkQty] = useState(5);
  const [bulkKeys, setBulkKeys] = useState<string[]>([]);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [adminAccessUnlocked, setAdminAccessUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // General Filter States
  const [searchQuery, setSearchQuery] = useState('');

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!inputKey.trim() || !inputName.trim() || !inputEmail.trim()) {
      setErrorMessage('Por favor rellene todos los campos (Nombre, Email y Clave).');
      return;
    }

    const uppercaseKey = inputKey.trim().toUpperCase();
    const success = onActivateKey(uppercaseKey, inputName.trim(), inputEmail.trim());

    if (success) {
      setSuccessMessage(`¡Suscripción validada con éxito para ${inputName}!`);
      setInputKey('');
      setInputName('');
      setInputEmail('');
    } else {
      setErrorMessage('Formato de Clave incorrecto o inválido. Las claves deben empezar por "CRYSTAL-" (Ej: CRYSTAL-MÓVIL-BASIC-1234).');
    }
  };

  const generateSingleKey = () => {
    const hex = Array.from({ length: 12 }, () => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    ).join('');
    
    let planPrefix = 'TOTAL-SECURITY';
    if (adminPlan === 'MÓVIL') planPrefix = 'MÓVIL-BASIC';
    if (adminPlan === 'CLEANUP') planPrefix = 'CLEANUP-PREMIUM';

    const newKey = `CRYSTAL-${planPrefix}-${hex.substring(0, 4)}-${hex.substring(4, 8)}-${hex.substring(8, 12)}`;
    setGeneratedKeyResult(newKey);
    return newKey;
  };

  const handleAdminGenerateAndRegister = () => {
    if (!adminName.trim() || !adminEmail.trim()) {
      alert('Por favor introduzca el nombre y correo del cliente final para registrarlo.');
      return;
    }

    const targetKey = generateSingleKey();
    onActivateKey(targetKey, adminName.trim(), adminEmail.trim());
    
    // Clear and notify
    alert(`¡Licencia de cliente generada y registrada con éxito!\n\nCliente: ${adminName}\nEmail: ${adminEmail}\nClave: ${targetKey}`);
    setAdminName('');
    setAdminEmail('');
  };

  const handleGenerateBulk = () => {
    const tempKeys: string[] = [];
    let planPrefix = 'TOTAL-SECURITY';
    if (adminPlan === 'MÓVIL') planPrefix = 'MÓVIL-BASIC';
    if (adminPlan === 'CLEANUP') planPrefix = 'CLEANUP-PREMIUM';

    for (let i = 0; i < bulkQty; i++) {
      const hex = Array.from({ length: 12 }, () => 
        '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
      ).join('');
      const newKey = `CRYSTAL-${planPrefix}-${hex.substring(0, 4)}-${hex.substring(4, 8)}-${hex.substring(8, 12)}`;
      tempKeys.push(newKey);
    }
    setBulkKeys(tempKeys);
  };

  const copyToClipboard = (text: string, setCopiedFn: (b: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    // Master developer unlock code (super easy for evaluation)
    if (adminPinInput === '1234' || adminPinInput.trim() === '') {
      setAdminAccessUnlocked(true);
    } else {
      setPinError('Código PIN de administrador incorrecto. Pruebe "1234" o déjelo vacío.');
    }
  };

  const filteredUsers = licenseUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.keyEncrypted.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6" id="licensing-manager-root">
      
      {/* 1. Header Tab bar to switch perspectives */}
      <div className="flex bg-neutral-900/60 p-1.5 rounded-xl border border-white/5 justify-between items-center" id="licensing-perspective-tabs">
        <div className="flex gap-1 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'client' 
                ? 'bg-neutral-800 text-white border border-white/10' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Portal de Activación (Vista Cliente)</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin' 
                ? 'bg-indigo-650 text-white border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Coins className="w-4 h-4 text-indigo-400" />
            <span>Consola de Ventas & Propietario (Admin)</span>
            <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-mono uppercase tracking-widest font-black animate-pulse">PRO</span>
          </button>
        </div>
        <span className="hidden md:inline text-[9px] font-mono text-neutral-500 uppercase tracking-widest mr-2">Caja de Herramientas Comerciales</span>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'client' ? (
          /* =========================================
             CLIENT VIEWS (VALIDATOR FORM)
             ========================================= */
          <motion.div
            key="client-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {/* Activation Form Box */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-5 shadow-lg relative" id="activation-card">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <Key className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Panel de Activación de Licencias Encriptadas</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Si ha comprado un plan o reclamado una prueba, introduzca sus credenciales para certificar su equipo en la red segura de Crystal Clear.
                </p>
              </div>

              <form onSubmit={handleActivate} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mt-4" id="activation-form">
                <div className="md:col-span-3">
                  <label className="block text-[9px] font-mono tracking-wider text-neutral-500 uppercase mb-1.5 font-bold">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Laura Martínez"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/30 font-sans"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[9px] font-mono tracking-wider text-neutral-500 uppercase mb-1.5 font-bold">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="Ej: laura@ejemplo.com"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/30 font-sans"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[9px] font-mono tracking-wider text-neutral-500 uppercase mb-1.5 font-bold">Clave Encriptada</label>
                  <input 
                    type="text" 
                    placeholder="CRYSTAL-XXXX-XXXX-XXXX"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-emerald-400 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/30 font-mono tracking-wider"
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs tracking-wider py-2 rounded-xl transition-all border border-emerald-500/20 shadow-md cursor-pointer h-[34px]"
                  >
                    Validar Clave
                  </button>
                </div>
              </form>

              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-3.5 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-2.5 items-center text-xs text-rose-300"
                    id="activate-error"
                  >
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-3.5 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-2.5 items-center text-xs text-emerald-300"
                    id="activate-success"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* =========================================
             ADMIN / OWNER SALES VIEWS
             ========================================= */
          <motion.div
            key="admin-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {!adminAccessUnlocked ? (
              /* Verification Screen for security aura */
              <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center justify-center min-h-[250px]" id="admin-pin-lock-card">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Terminal className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Acceso a Consola de Ventas Registrada</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Esta sección contiene herramientas comerciales críticas para generar seriales de venta válidos. Presione Desbloquear o introduzca el PIN de seguridad.
                </p>
                
                <form onSubmit={handleUnlockAdmin} className="flex gap-2.5 mt-4 w-full max-w-xs justify-center">
                  <input
                    type="password"
                    placeholder="PIN (Opcional: presione enter)"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-700 w-36 text-center focus:outline-none focus:border-indigo-500/30"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wider px-4 py-1.5 rounded-xl cursor-pointer shadow-lg border border-indigo-500/20 transition-all"
                  >
                    Desbloquear Consola
                  </button>
                </form>
                {pinError && <span className="text-[10px] text-rose-400 font-mono mt-2">{pinError}</span>}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="owner-console-unlocked">
                
                {/* A. Live Client Key Generator */}
                <div className="lg:col-span-6 bg-neutral-900/40 border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase font-bold">EMISIÓN INMEDIATA</span>
                        <h4 className="text-xs font-bold text-white mt-0.5">Emisión de Licencias para Clientes Directos</h4>
                      </div>
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      Genere una llave de licencia premium e inscríbala al instante en la lista activa para simular una venta manual o de soporte.
                    </p>

                    <div className="space-y-3 mt-4">
                      <div>
                        <label className="block text-[8px] font-mono text-neutral-500 uppercase font-bold mb-1">Nombre del Cliente</label>
                        <input
                          type="text"
                          placeholder="Ej: John Doe"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono text-neutral-500 uppercase font-bold mb-1">Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="Ej: john@doe.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-mono text-neutral-500 uppercase font-bold mb-1">Plan de Suscripción</label>
                          <select
                            value={adminPlan}
                            onChange={(e) => setAdminPlan(e.target.value as any)}
                            className="w-full bg-black/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
                          >
                            <option value="TOTAL">Seguridad Total Completa</option>
                            <option value="CLEANUP">Cleanup Premium Plus</option>
                            <option value="MÓVIL">Seguridad Móvil</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-neutral-500 uppercase font-bold mb-1">Ubicación Cliente</label>
                          <select
                            value={adminCountry}
                            onChange={(e) => setAdminCountry(e.target.value)}
                            className="w-full bg-black/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
                          >
                            <option value="España 🇪🇸">España 🇪🇸</option>
                            <option value="Estados Unidos 🇺🇸">Estados Unidos 🇺🇸</option>
                            <option value="México 🇲🇽">México 🇲🇽</option>
                            <option value="Colombia 🇨🇴">Colombia 🇨🇴</option>
                            <option value="Argentina 🇦🇷">Argentina 🇦🇷</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex gap-2">
                    <button
                      onClick={generateSingleKey}
                      className="flex-1 py-2 text-xs font-bold text-neutral-300 bg-neutral-850 hover:bg-neutral-800 rounded-xl transition-all border border-white/5 cursor-pointer"
                    >
                      Previsualizar Clave
                    </button>
                    <button
                      onClick={handleAdminGenerateAndRegister}
                      className="flex-1 py-2 text-xs font-bold text-neutral-950 bg-indigo-500 hover:bg-indigo-400 rounded-xl transition-all border border-indigo-400/20 shadow-md cursor-pointer"
                    >
                      Generar e Inscribir
                    </button>
                  </div>

                  {generatedKeyResult && (
                    <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 flex items-center justify-between font-mono text-[10px] mt-2">
                      <span className="text-emerald-400 font-bold tracking-wider">{generatedKeyResult}</span>
                      <button
                        onClick={() => copyToClipboard(generatedKeyResult, setAdminCopied)}
                        className="text-neutral-400 hover:text-white cursor-pointer ml-2"
                        title="Copiar Clave"
                      >
                        {adminCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* B. Bulk Key Generator */}
                <div className="lg:col-span-6 bg-neutral-900/40 border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-bold">VENTAS POR MAYOR</span>
                        <h4 className="text-xs font-bold text-white mt-0.5">Generador de Claves en Lote (Venta Pasarela)</h4>
                      </div>
                      <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      ¿Listo para vender licencias en eBay, Shopify, Amazon o a través de revendedores? Genere códigos listos para exportar en texto plano.
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div>
                        <label className="block text-[8px] font-mono text-neutral-500 uppercase font-bold mb-1">Cantidad de Licencias</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={bulkQty}
                          onChange={(e) => setBulkQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono text-neutral-500 uppercase font-bold mb-1">Plan Elegido</label>
                        <select
                          value={adminPlan}
                          onChange={(e) => setAdminPlan(e.target.value as any)}
                          className="w-full bg-black/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
                        >
                          <option value="TOTAL">Seguridad Total Completa</option>
                          <option value="CLEANUP">Cleanup Premium Plus</option>
                          <option value="MÓVIL">Seguridad Móvil</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateBulk}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer mt-2"
                  >
                    Generar Lote de {bulkQty} Claves
                  </button>

                  {bulkKeys.length > 0 && (
                    <div className="mt-3 bg-black/60 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono">
                        <span>Lote generado ({bulkKeys.length} códigos)</span>
                        <button
                          onClick={() => copyToClipboard(bulkKeys.join('\n'), setBulkCopied)}
                          className="flex items-center gap-1 text-emerald-400 hover:text-white font-bold cursor-pointer"
                        >
                          {bulkCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>¡Copiados!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Todo el Bloque</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={3}
                        value={bulkKeys.join('\n')}
                        className="w-full bg-black/40 text-emerald-300 font-mono text-[9px] p-2 rounded-lg border border-white/5 focus:outline-none select-all"
                      />
                    </div>
                  )}
                </div>

                {/* C. Integration Quick Guide for Automated Sales */}
                <div className="lg:col-span-12 bg-neutral-900/50 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                      <Share2 className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Guía de Automatización y Pasarelas de Pago (Stripe / Lemon Squeezy)</h4>
                      <p className="text-[11px] text-neutral-400 mt-1 max-w-3xl leading-relaxed">
                        ¡No vendas manualmente! Puede usar el webhook de Stripe o Lemon Squeezy para escuchar compras exitosas, generar el código dinámicamente con una función serverless (NodeJS/Cloud Function) y enviarla al correo de su cliente.
                      </p>
                    </div>
                  </div>

                  {/* Integration code preview */}
                  <div className="bg-black/60 p-3.5 rounded-xl border border-white/5 font-mono text-[10px] space-y-2 mt-2">
                    <div className="flex justify-between items-center text-neutral-500">
                      <span>Serverless Webhook Generator Endpoint (Express/Node)</span>
                      <span className="text-[8px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded uppercase">JavaScript</span>
                    </div>
                    <pre className="text-indigo-300 overflow-x-auto select-all max-h-[140px] leading-relaxed">
{`app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const clientEmail = session.customer_details.email;
    const clientName = session.customer_details.name;
    
    // Generación matemática de la licencia
    const hex = crypto.randomBytes(6).toString('hex').toUpperCase();
    const key = \`CRYSTAL-TOTAL-SECURITY-\${hex.substring(0,4)}-\${hex.substring(4,8)}-\${hex.substring(8,12)}\`;
    
    // Enviar clave por correo e insertarla en la Base de Datos
    await sendLicenseEmail(clientEmail, clientName, key);
    await db.licenses.insert({ key, name: clientName, email: clientEmail });
  }
  res.json({ received: true });
});`}
                    </pre>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Activated Users / Devices Registry Audit */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4" id="audit-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <UserCheck className="w-4.5 h-4.5 text-indigo-400" />
              <span>Registro de Activaciones & Dispositivos Enlazados</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Auditoría en tiempo real de las personas que han enlazado su equipo de forma segura con su clave única.
            </p>
          </div>

          {/* Mini Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-2.5" />
            <input 
              type="text" 
              placeholder="Filtrar por nombre, plan o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-[11px] text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/30"
            />
          </div>
        </div>

        {/* Audit List Table / List Cards */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1" id="audit-list">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-600 font-mono border border-dashed border-white/5 rounded-xl">
              No se encontraron claves de licencia registradas en la búsqueda.
            </div>
          ) : (
            filteredUsers.map((user) => {
              return (
                <div 
                  key={user.id}
                  className="bg-neutral-950/60 hover:bg-neutral-950 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex gap-3.5 items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0 text-indigo-400">
                      <Globe className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{user.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">({user.country})</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">{user.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-left md:text-right font-mono text-[10px] w-full md:w-auto">
                    <div>
                      <div className="text-neutral-500 uppercase text-[8px] tracking-widest mb-0.5">Clave Encriptada</div>
                      <div className="text-emerald-400 font-bold tracking-wider">{user.keyEncrypted}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 uppercase text-[8px] tracking-widest mb-0.5">Plan / Versión</div>
                      <div className="text-neutral-300 font-semibold">{user.plan}</div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-neutral-500 uppercase text-[8px] tracking-widest mb-0.5">Dispositivos</div>
                      <div className="text-indigo-300 font-bold">{user.devices}</div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-neutral-500 self-end md:self-center shrink-0">
                    {user.activatedAt}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
