const { STYLES, calculateGrade } = require('./api/protected-engine');
for (const type of ['J','JJ','MAX','MIN','CME','OC1','BASE','D1','D2','PX1','PX2','PX3','GRADE_CENTER','GRADE_UP','GRADE_DOWN']) {
  if (!STYLES[type] || STYLES[type].width !== 2) throw new Error(`estilo ${type} não está em espessura padrão 2`);
}
const grade = calculateGrade('WIN', 174000);
if (!grade.every((level) => level.width === 2)) throw new Error('grade WIN não está em espessura padrão 2');
console.log('win-width: estilos WIN/WDO e grade estão em espessura padrão 2 e podem ser ajustados na saída');
