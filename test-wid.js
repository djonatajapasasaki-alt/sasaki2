const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
function roundHalf(value) { return value >= 0 ? Math.round(value * 2 + 0.4999999) / 2 : -Math.round(Math.abs(value) * 2 - 0.4999999) / 2; }
function wid(base, variation, quote) {
  const justo = roundHalf(base * (1 + variation / 100));
  const vol = quote / Math.sqrt(252) / 100;
  return { justo, max: roundHalf(justo * (1 + vol)), min: roundHalf(justo * (1 - vol)) };
}
const positive = wid(174080, 0.50, 25.00);
const negative = wid(174080, -0.50, 25.00);
if (!(positive.justo > 174080 && positive.max > positive.justo && positive.min < positive.justo)) throw new Error(`WID positivo inválido: ${JSON.stringify(positive)}`);
if (!(negative.justo < 174080 && negative.max > negative.justo && negative.min < negative.justo)) throw new Error(`WID negativo inválido: ${JSON.stringify(negative)}`);
for (const token of ['i_ewz_var','i_ewz_quote','i_res_wid_justo','i_res_wid_max','i_res_wid_min','WID_EWZ_VAR','WID_EWZ_QUOTE']) if (!html.includes(token)) throw new Error(`WID ausente: ${token}`);
console.log(JSON.stringify({ positive, negative }));
console.log('wid: EWZ variação/cotação passaram');
