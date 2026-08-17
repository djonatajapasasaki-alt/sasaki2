const fs = require('fs');
const h = fs.readFileSync('./index.html', 'utf8');
if (h.includes('i_fechamento:\'win_points\'')) throw new Error('WIN ainda usa perfil inteligente removido.');
if (!h.includes("readField('i_fechamento')")) throw new Error('WIN não lê o campo diretamente.');
if (!h.includes("asset:'WIN'")) throw new Error('WIN não identifica o ativo no pedido protegido.');
if (!h.includes("/levels/calculate")) throw new Error('WIN não usa a rota protegida.');
if (h.includes('const justo=') || h.includes('const justissimo=')) throw new Error('fórmula principal do WIN exposta no HTML.');
console.log('win-protected-input: ok');
