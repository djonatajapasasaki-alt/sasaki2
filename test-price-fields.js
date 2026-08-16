const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const match = html.match(/const FIELD_PROFILES=\{([\s\S]*?)\n\};/);
if (!match) throw new Error('FIELD_PROFILES não encontrado.');
const profiles = match[1];
for (const id of ['i_var_sp500', 'i_var_micro', 'd_var_dxy', 'd_frp0', 'd_casado']) {
  if (profiles.includes(id)) throw new Error(`Campo que não é preço ainda está normalizado: ${id}`);
}
for (const id of ['d_fechamento', 'i_fechamento', 'd_ptax1', 'd_cme_durar', 'd_oc1_fech']) {
  if (!profiles.includes(id)) throw new Error(`Campo de preço deixou de ser normalizado: ${id}`);
}
console.log('price-fields: campos de preço e variação separados corretamente');
