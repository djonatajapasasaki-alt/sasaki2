const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
if (!html.includes("function readField(id, profile)")) throw new Error('leitura direta de campos não encontrada.');
for (const id of ['i_fechamento', 'i_var_sp500', 'i_var_micro', 'd_fechamento', 'd_var_dxy', 'd_frp0', 'd_ptax1', 'd_cme_durar', 'd_oc1_fech']) {
  if (!html.includes(id)) throw new Error(`campo ausente no frontend: ${id}`);
}
if (!html.includes("replace(',', '.')")) throw new Error('normalização ponto/vírgula ausente.');
console.log('price-fields: entradas diretas mantidas e enviadas ao cálculo protegido');
