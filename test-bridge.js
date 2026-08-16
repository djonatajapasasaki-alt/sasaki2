const levels = require('./levels-session.js');
const session = levels.createSession('2026-08-16-WDO');
levels.addLevels(session, [
  { asset: 'WDO', event: 'CALCULO', roundId: 'R1', levelId: 'J', type: 'J', label: 'J JUSTO', price: 5125.5, color: '#FFFFFF', width: 2 },
  { asset: 'WDO', event: 'PTAX', roundId: 'PX1', levelId: 'MAX', type: 'MAX', label: 'PX1 MAX +0,50%', price: 5151, color: '#83C7FF', width: 1 },
]);
const ntsl = levels.exportProfitNtsl(session);
const groovy = levels.exportTrydGroovy(session);
if (!ntsl.includes('PlotN(1, N1);') || !ntsl.includes('RGB(255,255,255)') || !ntsl.includes('SetPlotWidth(1, 2);')) throw new Error('NTSL não contém o nível/cor/espessura esperados.');
if (!groovy.includes('class SasakiFrozenLevelsProcess') || !groovy.includes('price:5125.5') || !groovy.includes("label:'J JUSTO'")) throw new Error('Groovy não contém os níveis esperados.');
if (!levels.exportTrydCsv(session).includes('Ativo;Preco;Rotulo;Cor;Espessura')) throw new Error('CSV Tryd inválido.');
if (!levels.exportProfitCsv(session).includes('Ativo;Preco;Nome;CorHex;Largura')) throw new Error('CSV Profit inválido.');
console.log('bridge: todos os testes passaram');
