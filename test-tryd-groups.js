const fs = require('fs');
const levels = require('./levels-session.js');
const html = fs.readFileSync('./index.html', 'utf8');
const session = levels.createSession('GROUPS');
levels.addLevels(session, [
  {asset:'WIN',event:'CALCULO',roundId:'R1',levelId:'J',type:'J',label:'WIN JUSTO',price:100,width:2,color:'#FFF'},
  {asset:'WIN',event:'GRADE',roundId:'R1',levelId:'G1',type:'GRADE',label:'GRADE WIN 1',price:101,width:2,color:'#FFF'},
  {asset:'WDO',event:'PTAX',roundId:'PX1',levelId:'MAX',type:'MAX',label:'WDO PX1 MAX',price:102,width:2,color:'#FFF'},
  {asset:'WDO',event:'CME',roundId:'R1',levelId:'CME1',type:'CME',label:'CME ACORDO',price:103,width:2,color:'#FFF'},
]);
for (const group of ['principal','grade','ptax','extras']) {
  const out = levels.exportTrydGroup(session, group);
  if (!out.includes('getInput_Double')) throw new Error(`formato anterior ausente em ${group}`);
  if (!out.includes('setLabel("SASAKI |')) throw new Error(`nome ausente em ${group}`);
}
const principal = levels.exportTrydGroup(session, 'principal');
if (!principal.includes('GRADE WIN')) throw new Error('grade não está junto do principal');
if (!principal.includes('CME ACORDO')) throw new Error('CME não está junto do principal');
if (!html.includes("baixarScriptTrydGrupo('WDO','ptax')")) throw new Error('botão WDO PTAX ausente');
if (html.includes("baixarScriptTrydGrupo('WDO','extras')") || html.includes("baixarScriptTrydGrupo('WIN','extras')")) throw new Error('botão Extras separado ainda presente');
console.log('tryd-groups: Principal contém níveis WDO/WIN; PTAX é o único grupo separado');
