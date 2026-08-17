const levels = require('./levels-session.js');
const session = levels.createSession('TESTE');
levels.addLevels(session, [
  { asset:'WIN', event:'VIX', roundId:'R1', levelId:'MAX1', type:'MAX', label:'MAX', price:100, color:'#83C7FF', width:2 },
  { asset:'WIN', event:'WID', roundId:'R1', levelId:'MAX2', type:'MAX', label:'MAX', price:101, color:'#83C7FF', width:2 },
  { asset:'WDO', event:'PTAX', roundId:'PX1', levelId:'MAX3', type:'MAX', label:'MAX', price:102, color:'#83C7FF', width:2 },
  { asset:'WDO', event:'PTAX', roundId:'PX2', levelId:'MAX4', type:'MAX', label:'MAX', price:103, color:'#83C7FF', width:2 },
  { asset:'WIN', event:'VIX', roundId:'R1', levelId:'MIN1', type:'MIN', label:'MIN', price:99, color:'#FF4D5A', width:2 },
  { asset:'WDO', event:'PTAX', roundId:'PX1', levelId:'MIN2', type:'MIN', label:'MIN', price:98, color:'#FF4D5A', width:2 },
]);
const groovy = levels.exportTrydIndicator(session);
const labels = [...groovy.matchAll(/getInput_Double\("([^"]+)"/g)].map((m) => m[1]);
if (new Set(labels).size !== labels.length) throw new Error(`rótulos duplicados: ${labels.join('|')}`);
if (!labels.some((x) => x.includes('WIN WID'))) throw new Error('origem WID ausente');
if (!labels.some((x) => x.includes('WDO PTAX'))) throw new Error('origem PTAX ausente');
console.log(labels.join('\n'));
console.log('unique-labels: todos os rótulos Tryd são únicos');
