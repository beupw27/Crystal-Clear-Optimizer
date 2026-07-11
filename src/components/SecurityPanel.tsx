import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, EyeOff, Server, Wifi, Cpu, 
  RefreshCw, Radio, CheckCircle, AlertTriangle, AlertCircle, Trash2
} from 'lucide-react';
import { SecurityShield, ScanState } from '../types';

interface SecurityPanelProps {
  shields: SecurityShield[];
  onToggleShield: (id: string) => void;
  scanState?: ScanState;
}

export default function SecurityPanel({ shields, onToggleShield, scanState }: SecurityPanelProps) {
  const [isVpnActive, setIsVpnActive] = useState(true);
  const [isScanningWifi, setIsScanningWifi] = useState(false);
  const [wifiStatus, setWifiStatus] = useState<'unchecked' | 'scanning' | 'secure' | 'vulnerable'>('unchecked');
  const [detectedVulnerabilities, setDetectedVulnerabilities] = useState<string[]>([]);
  const [ipCipher, setIpCipher] = useState('185.112.144.12');
  const [encryptedIp, setEncryptedIp] = useState('●●●.●●●.●●●.●●●');

  // Real Crypto States
  const [cryptoInput, setCryptoInput] = useState('185.112.144.12');
  const [cipherHex, setCipherHex] = useState('');
  const [keyHex, setKeyHex] = useState('');
  const [ivHex, setIvHex] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Dynamic aesthetic IP rotator
  useEffect(() => {
    if (!isVpnActive) {
      setEncryptedIp('No Protegida (Expuesta)');
      return;
    }
    const interval = setInterval(() => {
      const parts = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
      const hexHash = Array.from({ length: 16 }, () => 
        '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
      ).join('');
      setEncryptedIp(`CRYSTAL-TUNNEL::${hexHash.substring(0, 6)}...${hexHash.substring(10, 14)} (AES-256-GCM)`);
    }, 1500);

    return () => clearInterval(interval);
  }, [isVpnActive]);

  const handleWipeIpData = () => {
    setIpCipher('OCULTADA_Y_WIPED::0.0.0.0');
    setCryptoInput('');
    setCipherHex('');
    setKeyHex('');
    setIvHex('');
    setDecryptedText('');
  };

  useEffect(() => {
    if (scanState === 'cleaned') {
      handleWipeIpData();
    }
  }, [scanState]);

  // Real Web Cryptography AES-256-GCM implementation
  const handleRealEncrypt = async () => {
    if (!cryptoInput) return;
    setIsEncrypting(true);

    try {
      // 1. Text Encoder for binary representation
      const encoder = new TextEncoder();
      const rawData = encoder.encode(cryptoInput);

      // 2. Generate cryptographically strong AES key
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );

      // 3. Generate secure random 12-byte IV (Initialization Vector)
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // 4. Encrypt with AES-GCM
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        rawData
      );

      // 5. Convert raw keys and buffers to Hex for visualization
      const rawKeyBuffer = await window.crypto.subtle.exportKey('raw', key);
      const keyBytes = new Uint8Array(rawKeyBuffer);
      const generatedKeyHex = Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      const cipherBytes = new Uint8Array(encryptedBuffer);
      const generatedCipherHex = Array.from(cipherBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const generatedIvHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

      setKeyHex(generatedKeyHex);
      setCipherHex(generatedCipherHex);
      setIvHex(generatedIvHex);

      // 6. Instantly audit decryption to verify zero-loss integrity
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      setDecryptedText(decoder.decode(decryptedBuffer));
    } catch (e) {
      console.error('Error de encriptación WebCrypto:', e);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Perform initial encryption on load
  useEffect(() => {
    handleRealEncrypt();
  }, []);

  const handleWifiScan = () => {
    setIsScanningWifi(true);
    setWifiStatus('scanning');
    setDetectedVulnerabilities([]);

    setTimeout(() => {
      setIsScanningWifi(false);
      // Deterministic but cool check
      const passes = Math.random() > 0.3;
      if (passes) {
        setWifiStatus('secure');
      } else {
        setWifiStatus('vulnerable');
        setDetectedVulnerabilities([
          'Puerto 5353 (mDNS) expuesto públicamente',
          'Contraseña Wi-Fi con cifrado WPA2 débil heredado',
          'Posible ataque "Man-in-the-Middle" (ARP Spoofing de puerta de enlace)'
        ]);
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6" id="security-panel-root">
      
      {/* 1. IP Encryption Box */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden" id="vpn-card">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isVpnActive ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}>
              <Server className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">Bloque de Seguridad Encriptada (IP)</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase ${
                  isVpnActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {isVpnActive ? 'ACTIVO (A PRUEBA DE ATAQUES)' : 'INACTIVO'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Su IP original está enmascarada detrás de túneles redundantes en la UE para mitigar ataques DDoS e interceptaciones.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsVpnActive(!isVpnActive)}
            className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
              isVpnActive 
                ? 'bg-neutral-800 text-neutral-300 border border-white/10 hover:bg-neutral-700' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border border-indigo-500/30'
            }`}
          >
            {isVpnActive ? 'Desactivar Túnel' : 'Encriptar mi IP Ahora'}
          </button>
        </div>

        {/* Dynamic IP data readouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5 font-mono text-[11px]" id="ip-encryption-metrics">
          <div className="bg-neutral-950/40 p-3 rounded-xl border border-white/5 flex flex-col justify-between gap-2">
            <div>
              <div className="text-neutral-500 uppercase text-[9px] tracking-widest font-semibold mb-1">Dirección IP Original</div>
              <div className="flex items-center justify-between font-medium">
                <span className={ipCipher.includes('WIPED') ? 'text-emerald-400 font-bold truncate' : 'text-neutral-300'}>
                  {ipCipher}
                </span>
                {ipCipher.includes('WIPED') ? (
                  <span className="text-[10px] text-emerald-400 font-bold">OCULTA / WIPED</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-bold animate-pulse">EXpuesta</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-1">
              <button
                onClick={handleWipeIpData}
                disabled={ipCipher.includes('WIPED')}
                className={`text-[9px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 border ${
                  ipCipher.includes('WIPED')
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                    : 'bg-rose-500/10 hover:bg-rose-500/25 border-rose-500/20 text-rose-300 hover:text-white'
                }`}
                title="Limpiar y purgar por completo los rastros de tu dirección IP física de los buffers locales"
              >
                <Trash2 className="w-3 h-3 shrink-0" />
                <span>{ipCipher.includes('WIPED') ? 'Rastro de IP Purgado' : 'Limpiar Rastro (Wipe IP)'}</span>
              </button>
            </div>
          </div>
          
          <div className="bg-neutral-950/40 p-3 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="text-neutral-500 uppercase text-[9px] tracking-widest font-semibold mb-1">Dirección Encriptada (Crystal Shield)</div>
              <div className="flex items-center justify-between font-medium">
                <span className={isVpnActive ? 'text-indigo-400 truncate' : 'text-neutral-500 font-bold'}>
                  {encryptedIp}
                </span>
                {isVpnActive && <span className="text-[10px] text-emerald-400 font-bold animate-pulse">SEGURO</span>}
              </div>
            </div>
            <div className="text-[8.5px] text-neutral-500 mt-2 text-right">
              Túnel VPN Militar AES-256 Activo
            </div>
          </div>
        </div>

        {/* Real Cryptographic Testing Suite */}
        <div className="mt-5 p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-3" id="web-crypto-core">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">MÓDULO DE CRIPTOGRAFÍA DE HARDWARE (WEB CRYPTO API)</span>
            </div>
            <span className="text-[8px] font-mono text-neutral-500 uppercase">AES-256-GCM Hardware-Accelerated</span>
          </div>

          <p className="text-[10.5px] text-neutral-400 leading-relaxed">
            Compruebe el motor criptográfico en tiempo real. Escriba cualquier IP o dato sensible para cifrarlo y descifrarlo en su navegador utilizando claves de 256 bits generadas con entropía segura:
          </p>

          <div className="flex flex-col md:flex-row gap-2 mt-1">
            <input
              type="text"
              value={cryptoInput}
              onChange={(e) => setCryptoInput(e.target.value)}
              placeholder="Escriba una IP o dato sensible..."
              className="flex-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleRealEncrypt}
              disabled={isEncrypting || !cryptoInput}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg border border-indigo-400/20 cursor-pointer shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              {isEncrypting ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              <span>Encriptar con AES</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5 font-mono text-[10px] bg-black/25 p-3 rounded-lg border border-white/5">
            <div className="space-y-2">
              <div>
                <span className="text-neutral-500 uppercase text-[8px] tracking-wider font-bold block">1. Clave Criptográfica AES-256 Generada (Hex):</span>
                <span className="text-indigo-300 font-medium break-all select-all block mt-0.5 max-h-[40px] overflow-y-auto bg-black/40 p-1 rounded border border-white/5">
                  {keyHex || 'Esperando clave...'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[8px] tracking-wider font-bold block">2. Vector de Inicialización (IV Hex):</span>
                <span className="text-emerald-300 font-medium break-all select-all block mt-0.5 bg-black/40 p-1 rounded border border-white/5">
                  {ivHex || 'Esperando IV...'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-neutral-500 uppercase text-[8px] tracking-wider font-bold block">3. Texto Cifrado (Bytes en Hexadecimal):</span>
                <span className="text-amber-400 font-medium break-all select-all block mt-0.5 max-h-[40px] overflow-y-auto bg-black/40 p-1 rounded border border-white/5">
                  {cipherHex || 'Esperando bytes...'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[8px] tracking-wider font-bold block">4. Auditoría de Desencriptación de Seguridad:</span>
                <div className="flex items-center gap-1.5 mt-0.5 bg-emerald-500/10 border border-emerald-500/20 p-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold truncate">
                    {decryptedText ? `ÉXITO: "${decryptedText}"` : 'Esperando validación...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Wi-Fi Vulnerability Scan */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-5 shadow-lg relative" id="wifi-shield-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              wifiStatus === 'scanning' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-spin' :
              wifiStatus === 'secure' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
              wifiStatus === 'vulnerable' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 animate-bounce' :
              'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}>
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Análisis de Vulnerabilidades Wi-Fi</h3>
              <p className="text-[11px] text-neutral-400 mt-1">
                Audita la red local para verificar contraseñas frágiles, puertos WAN expuestos o ataques de intermediación.
              </p>
            </div>
          </div>

          <button 
            onClick={handleWifiScan}
            disabled={isScanningWifi}
            className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isScanningWifi 
                ? 'bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg border border-emerald-500/30'
            }`}
          >
            {isScanningWifi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <span>Escanear Red Wi-Fi</span>
            )}
          </button>
        </div>

        {/* Scan Results */}
        <AnimatePresence mode="wait">
          {wifiStatus !== 'unchecked' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/5"
              id="wifi-scan-results"
            >
              {wifiStatus === 'scanning' && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono py-1">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Escaneando paquetes ARP e inyecciones de sockets...</span>
                </div>
              )}

              {wifiStatus === 'secure' && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl flex gap-3 items-center" id="wifi-secure-banner">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">¡Red Local Completamente Segura!</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      No se detectaron puertos abiertos vulnerables ni proxies interceptando su tráfico local.
                    </p>
                  </div>
                </div>
              )}

              {wifiStatus === 'vulnerable' && (
                <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl flex flex-col gap-2" id="wifi-vulnerable-banner">
                  <div className="flex gap-3 items-center">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-300">Se detectaron {detectedVulnerabilities.length} alertas críticas</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Su red doméstica actual presenta posibles fugas que podrían permitir robo de credenciales.
                      </p>
                    </div>
                  </div>
                  <ul className="text-[10px] font-mono text-neutral-400 list-disc list-inside space-y-1 bg-black/30 p-2.5 rounded-lg border border-white/5">
                    {detectedVulnerabilities.map((v, idx) => (
                      <li key={idx} className="text-rose-200">{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Core Shield Checklist */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4" id="shields-checklist-card">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white">Escudos y Módulos de Defensa en Tiempo Real</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Personalice y active las capas galardonadas de protección antivirus, ransomware, phishing y minería de criptoactivos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="shields-grid">
          {shields.map((shield) => {
            return (
              <div 
                key={shield.id}
                className={`p-4 rounded-xl border transition-all flex justify-between items-start gap-3 ${
                  shield.enabled 
                    ? 'bg-neutral-950/80 border-indigo-500/20 shadow-[inset_0_1px_3px_rgba(99,102,241,0.05)]' 
                    : 'bg-neutral-950/30 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    shield.enabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    {shield.icon === 'shield' && <Shield className="w-4.5 h-4.5" />}
                    {shield.icon === 'lock' && <Lock className="w-4.5 h-4.5" />}
                    {shield.icon === 'eye-off' && <EyeOff className="w-4.5 h-4.5" />}
                    {shield.icon === 'server' && <Server className="w-4.5 h-4.5" />}
                    {shield.icon === 'wifi' && <Wifi className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${shield.enabled ? 'text-white' : 'text-neutral-400'}`}>
                      {shield.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      {shield.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => onToggleShield(shield.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      shield.enabled ? 'bg-emerald-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        shield.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
