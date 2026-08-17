const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const engine = fs.readFileSync('./api/protected-engine.js', 'utf8');
if (!html.includes("/levels/calculate")) throw new Error('HTML não usa cálculo protegido.');
if (!html.includes("kind:'GRADE'")) throw new Error('HTML não solicita grade protegida.');
for (const token of ['OC1', 'BASE', 'SONHO', 'CME', 'PTAX', 'WID_EWZ_VAR', 'WID_EWZ_QUOTE']) {
  if (!engine.includes(token)) throw new Error(`módulo protegido sem grupo: ${token}`);
}
if (html.includes('const I_NIVEIS=') || html.includes('const D_NIVEIS=')) throw new Error('listas de grade ainda estão expostas no HTML.');
console.log('export-complete: cálculo e grupos proprietários estão no backend protegido');
