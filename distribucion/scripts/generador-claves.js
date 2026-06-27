/**
 * 🔑 CRYSTAL CLEAR LICENSE KEY GENERATOR - CLI TOOL
 * 
 * Uso local en Node.js:
 *   node generador-claves.js [PLAN] [CANTIDAD]
 * 
 * Planes disponibles:
 *   1. TOTAL   - Seguridad Total Completa (CRYSTAL-TOTAL-SECURITY-...)
 *   2. CLEANUP - Cleanup Premium Plus     (CRYSTAL-CLEANUP-PREMIUM-...)
 *   3. MÓVIL   - Seguridad Móvil          (CRYSTAL-MÓVIL-BASIC-...)
 * 
 * Ejemplo:
 *   node generador-claves.js TOTAL 5
 */

const crypto = require('crypto');

const planArgs = process.argv[2] ? process.argv[2].toUpperCase() : 'TOTAL';
const qtyArgs = parseInt(process.argv[3]) || 1;

let prefix = 'TOTAL-SECURITY';
let planName = 'Seguridad Total Completa';

if (planArgs === 'MÓVIL' || planArgs === 'MOVIL' || planArgs === 'MOBILE' || planArgs === 'BASIC') {
  prefix = 'MÓVIL-BASIC';
  planName = 'Seguridad Móvil';
} else if (planArgs === 'CLEANUP' || planArgs === 'PREMIUM') {
  prefix = 'CLEANUP-PREMIUM';
  planName = 'Cleanup Premium Plus';
}

console.log('====================================================');
console.log('🔑 GENERADOR DE CLAVES CRYSTAL CLEAR OPTIMIZER');
console.log(`📋 Plan seleccionado: ${planName} (${prefix})`);
console.log(`📦 Cantidad a emitir: ${qtyArgs}`);
console.log('====================================================\n');

for (let i = 0; i < qtyArgs; i++) {
  // Genera bytes criptográficos aleatorios de alta entropía
  const hex = crypto.randomBytes(6).toString('hex').toUpperCase();
  const key = `CRYSTAL-${prefix}-${hex.substring(0, 4)}-${hex.substring(4, 8)}-${hex.substring(8, 12)}`;
  console.log(`  [${i + 1}]  ${key}`);
}

console.log('\n====================================================');
console.log('✨ Claves listas para registrar en la consola o enviar.');
console.log('====================================================');
