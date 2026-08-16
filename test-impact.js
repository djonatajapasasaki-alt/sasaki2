const calc = require('./calculation-core.js');
const levels = require('./levels-session.js');

const stats = calc.impactRegression([
  { desvio: -2, wdo_pontos: -7 },
  { desvio: -1, wdo_pontos: -4 },
  { desvio: 1, wdo_pontos: 2 },
  { desvio: 2, wdo_pontos: 5 },
], 'desvio', 'wdo_pontos');
if (Math.abs(stats.beta - 3) > 1e-9) throw new Error(`Beta inesperado: ${stats.beta}`);
if (Math.abs(calc.projectImpact(stats, 3) - 8) > 1e-9) throw new Error('Projeção inesperada.');

const session = levels.createSession('2026-08-15-WDO');
levels.addLevels(session, [{ sessionId: session.sessionId, asset: 'WDO', event: 'PTAX', roundId: 'PX1', levelId: 'CENTER', type: 'PX1', label: 'PX1 CENTRO', price: 5125.5 }]);
levels.addLevels(session, [{ sessionId: session.sessionId, asset: 'WDO', event: 'PTAX', roundId: 'PX1', levelId: 'CENTER', type: 'PX1', label: 'PX1 CENTRO', price: 5199.5 }]);
if (session.levels.length !== 1 || session.levels[0].price !== 5125.5) throw new Error('Nível congelado foi movido ou duplicado.');
levels.addLevels(session, [{ sessionId: session.sessionId, asset: 'WDO', event: 'PTAX', roundId: 'PX2', levelId: 'CENTER', type: 'PX2', label: 'PX2 CENTRO', price: 5130.5 }]);
if (session.levels.length !== 2) throw new Error('Nova rodada PTAX não foi adicionada.');
console.log('impacto e congelamento: todos os testes passaram');
