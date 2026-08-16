const calc = require('./calculation-core.js');
function read(raw) { const s=String(raw).trim().replace(',', '.'); return s ? Number(s) : NaN; }
function win(fechamento, sp, micro, vix) {
  const justo=calc.roundHalf(fechamento*(1+sp/100));
  const justissimo=calc.roundHalf(justo*(1+micro/100));
  const vol=vix/Math.sqrt(252)/100;
  return { justo, justissimo, maxima:calc.roundHalf(justo*(1+vol)), minima:calc.roundHalf(justo*(1-vol)) };
}
const pos=win(read('174080'),read('+0,12'),read('+0,11'),read('19,28'));
const neg=win(read('174080'),read('-0,12'),read('-0,11'),read('19,28'));
if (!(pos.justo > 174080 && pos.justissimo > pos.justo)) throw new Error(`positivo inválido: ${JSON.stringify(pos)}`);
if (!(neg.justo < 174080 && neg.justissimo < neg.justo)) throw new Error(`negativo inválido: ${JSON.stringify(neg)}`);
const html=require('fs').readFileSync('./index.html','utf8');
if (!html.includes(".trim().replace(',', '.')")) throw new Error('leitura de sinal não encontrada');
if (!html.includes('placeholder="+0.12 ou -0.12"')) throw new Error('placeholder de sinal não encontrado');
console.log(JSON.stringify({pos,neg}));
console.log('signs: positivo e negativo passaram');
