const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const required = [
  "event:'GRADE'",
  "event:'VIX_IBOV'",
  "event:'OC1'",
  "event:'BASE'",
  "event:'SONHO'",
  "event:'CME'",
  "event:'PTAX'",
  "const roundId=`PX${i+1}`",
  "type:'CME'",
  "type:'BASE'",
  "type:'D1'",
];
for (const token of required) if (!html.includes(token)) throw new Error(`grupo ausente: ${token}`);
console.log('export-complete: WIN/WDO têm grade, VIX IBOV, OC1, BASE, SONHO, CME e PTAX');
