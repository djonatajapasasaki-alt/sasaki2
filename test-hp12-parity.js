const calc = require('./calculation-core.js');
function hp12PercentAdd(base, variationPercent) {
  return calc.roundHalf(base * (1 + variationPercent / 100));
}
const fechamento = 174080;
const varSp = 0.12;
const varMicro = 0.11;
const vix = 19.28;
const justo = hp12PercentAdd(fechamento, varSp);
const justissimo = hp12PercentAdd(justo, varMicro);
const vol = vix / Math.sqrt(252) / 100;
const maxima = calc.roundHalf(justo * (1 + vol));
const minima = calc.roundHalf(justo * (1 - vol));
if (justo !== 174289) throw new Error(`Justo HP12 esperado 174289, recebido ${justo}`);
if (justissimo !== 174481) throw new Error(`Justíssimo HP12 esperado 174481, recebido ${justissimo}`);
if (maxima !== calc.roundHalf(justo * (1 + vol))) throw new Error('Máxima divergente');
if (minima !== calc.roundHalf(justo * (1 - vol))) throw new Error('Mínima divergente');
console.log(JSON.stringify({ justo, justissimo, maxima, minima, vol }));
console.log('hp12-parity: todos os casos passaram');
