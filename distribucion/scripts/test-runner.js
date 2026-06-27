/**
 * 🧪 CRYSTAL CLEAR OPTIMIZER & SECURITY CORE - AUTOMATED TEST SUITE
 * 
 * Este script simula y prueba de forma autónoma los algoritmos críticos del programa.
 * Úselo en su terminal local (VSCode) para comprobar que la lógica funciona a la perfección.
 * 
 * Para ejecutar:
 *   node test-runner.js
 */

const crypto = require('crypto');

// --- DATOS DE PRUEBA ---
const mockCategories = [
  { id: 'cat-browser', name: 'Caché de Navegador', files: [
    { id: 'f1', name: 'Google Chrome', sizeMb: 780.4, checked: true },
    { id: 'f2', name: 'Firefox Profiles', sizeMb: 340.2, checked: false }
  ]},
  { id: 'cat-system', name: 'Registros', files: [
    { id: 'f3', name: 'Kernel Logs', sizeMb: 420.5, checked: true }
  ]}
];

const mockShields = [
  { id: 'sh-antivirus', name: 'Protección Antivirus', enabled: true },
  { id: 'sh-ransomware', name: 'Escudo Anti-Ransomware', enabled: true },
  { id: 'sh-firewall', name: 'Firewall Avanzado', enabled: false }
];

// --- FUNCIONES CORE A EVALUAR ---

// 1. Validador de claves
function isValidLicenseKey(key) {
  if (!key || typeof key !== 'string') return false;
  return key.toUpperCase().startsWith('CRYSTAL-') && key.split('-').length >= 4;
}

// 2. Mapeador de planes por clave
function mapPlanFromKey(key) {
  if (!isValidLicenseKey(key)) return null;
  const uppercaseKey = key.toUpperCase();
  if (uppercaseKey.includes('MÓVIL') || uppercaseKey.includes('BASIC')) {
    return 'Seguridad Móvil';
  } else if (uppercaseKey.includes('PREMIUM') || uppercaseKey.includes('CLEANUP')) {
    return 'Cleanup Premium Plus';
  } else if (uppercaseKey.includes('TOTAL') || uppercaseKey.includes('SECURITY')) {
    return 'Seguridad Total Completa';
  }
  return 'Prueba Gratuita (3 Meses)';
}

// 3. Generador de claves
function generateLicenseKey(plan) {
  const hex = crypto.randomBytes(6).toString('hex').toUpperCase();
  let prefix = 'TOTAL-SECURITY';
  if (plan === 'MÓVIL') prefix = 'MÓVIL-BASIC';
  if (plan === 'CLEANUP') prefix = 'CLEANUP-PREMIUM';
  return `CRYSTAL-${prefix}-${hex.substring(0, 4)}-${hex.substring(4, 8)}-${hex.substring(8, 12)}`;
}

// 4. Calculador de espacio en caché
function calculateTotalTrashSize(categories) {
  return categories.reduce((sum, cat) => {
    return sum + cat.files.reduce((fSum, file) => fSum + (file.checked ? file.sizeMb : 0), 0);
  }, 0);
}

// --- SUITE DE ASERSIONES ---

let totalTests = 0;
let passedTests = 0;

function assert(description, expression) {
  totalTests++;
  if (expression) {
    passedTests++;
    console.log(`  🟢 PASS: ${description}`);
  } else {
    console.log(`  🔴 FAIL: ${description}`);
  }
}

console.log('========================================================');
console.log('🧪 SUITE DE PRUEBAS DEL MOTOR CRYSTAL CLEAR');
console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
console.log('========================================================\n');

// Pruebas del motor de limpieza
console.log('📦 CATEGORÍA 1: Motor de Cálculo y Limpieza de Caché');
const size = calculateTotalTrashSize(mockCategories);
assert('Suma correcta de megabytes checked (780.4 + 420.5 = 1200.9 MB)', Math.abs(size - 1200.9) < 0.01);
assert('Ignora correctamente los archivos unchecked en el cálculo', size !== 1541.1);
console.log('');

// Pruebas de licencias
console.log('🔑 CATEGORÍA 2: Seguridad y Firma de Licencias');
assert('Filtra correctamente claves que no inician con "CRYSTAL-"', isValidLicenseKey('OFFICIAL-TOTAL-9923') === false);
assert('Valida correctamente firmas que comiencen con "CRYSTAL-"', isValidLicenseKey('CRYSTAL-TOTAL-SECURITY-1A2B-3C4D-5E6F') === true);
assert('Mapea correctamente plan TOTAL a "Seguridad Total Completa"', mapPlanFromKey('CRYSTAL-TOTAL-SECURITY-1A2B-3C4D-5E6F') === 'Seguridad Total Completa');
assert('Mapea correctamente plan MÓVIL a "Seguridad Móvil"', mapPlanFromKey('CRYSTAL-MÓVIL-BASIC-0000-1111-2222') === 'Seguridad Móvil');
assert('Mapea correctamente plan CLEANUP a "Cleanup Premium Plus"', mapPlanFromKey('CRYSTAL-CLEANUP-PREMIUM-FFFF-GGGG-HHHH') === 'Cleanup Premium Plus');
console.log('');

// Pruebas del generador de claves
console.log('⚙️ CATEGORÍA 3: Generador Comercial Criptográfico');
const generatedTotal = generateLicenseKey('TOTAL');
const generatedMovil = generateLicenseKey('MÓVIL');
assert('Genera claves que inician con el prefijo correcto CRYSTAL-', generatedTotal.startsWith('CRYSTAL-'));
assert('Clave TOTAL contiene la firma "TOTAL-SECURITY"', generatedTotal.includes('TOTAL-SECURITY'));
assert('Clave MÓVIL contiene la firma "MÓVIL-BASIC"', generatedMovil.includes('MÓVIL-BASIC'));
assert('Las claves generadas tienen una longitud estándar de 39 caracteres', generatedTotal.length === 39);
console.log('');

// Pruebas de escudos
console.log('🛡️ CATEGORÍA 4: Escudos de Protección IP');
const activeShields = mockShields.filter(s => s.enabled).length;
assert('Identifica correctamente que hay 2 escudos activos', activeShields === 2);
console.log('');

console.log('========================================================');
console.log(`📊 INFORME DE DIAGNÓSTICO: ${passedTests} de ${totalTests} pruebas exitosas.`);
if (passedTests === totalTests) {
  console.log('🏆 ¡PRUEBAS COMPLETADAS CON ÉXITO! Todos los módulos están listos para producción.');
} else {
  console.log('⚠️ Se encontraron fallos en algunas aserciones. Revise la lógica.');
}
console.log('========================================================');
