const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
if (html.includes('/input-normalizer.js')) throw new Error('O normalizador ainda está carregado');
if (html.includes('SasakiInput')) throw new Error('O normalizador ainda é usado');
if (html.includes('normalizeVisibleField')) throw new Error('Ainda existe normalização visual');
if (!html.includes('return el ? parseFloat(el.value) : NaN;')) throw new Error('Leitura direta não foi restaurada');
if (!html.includes('function macroNum(id){')) throw new Error('Leitura direta do macro não foi restaurada');
console.log('no-smart-fields: normalizador removido e leitura direta restaurada');
