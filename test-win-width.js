const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
if (!html.includes("styleFor(level.type),{width:2}")) throw new Error('níveis principais WIN não estão em espessura 2');
if (!html.includes("WID JUSTO EWZ VAR',price:widJusto,percent:0,color:'#FFFFFF',width:2")) throw new Error('WID Justo não está em espessura 2');
if (!html.includes("styleFor(level.type),{width:2})));")) throw new Error('IBOV não está em espessura 2');
if (!html.includes('percent:n.pct*100,color:s.color,width:2')) throw new Error('grade WIN não está em espessura 2');
console.log('win-width: níveis WIN, WID, IBOV e grade estão em espessura 2');
