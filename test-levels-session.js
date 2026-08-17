const assert = require('node:assert/strict');
const levels = require('./levels-session.js');

const session = levels.createSession('2026-08-15-WDO-R1');
const first = levels.addLevels(session, [
  {asset:'WDO', event:'PTAX', roundId:'PX1', type:'J', label:'J', price:5125.5, percent:0, color:'#fff', width:2},
  {asset:'WDO', event:'PTAX', roundId:'PX1', type:'MAX', label:'MAX +0,50%', price:5151, percent:0.5, color:'#8cc8ff', width:1},
]);
assert.equal(first.added.length, 2);
const second = levels.addLevels(session, [
  {asset:'WDO', event:'PTAX', roundId:'PX1', type:'J', label:'J', price:5125.5, percent:0, color:'#fff', width:2},
  {asset:'WDO', event:'PTAX', roundId:'PX2', type:'J', label:'J', price:5130, percent:0, color:'#fff', width:2},
]);
assert.equal(second.added.length, 1);
assert.equal(session.levels.length, 3);
levels.freeze(session);
const third = levels.addLevels(session, [{asset:'WDO', event:'PTAX', roundId:'PX3', type:'J', label:'J', price:5140, percent:0, color:'#fff', width:2}]);
assert.equal(third.frozen, true);
assert.equal(session.levels.length, 3);
const originalPrice = session.levels[0].price;
levels.updateStyles(session, [{asset:'WDO', event:'PTAX', roundId:'PX1', type:'J', label:'J', color:'#00FF00', width:5}]);
assert.equal(session.levels[0].price, originalPrice);
assert.equal(session.levels[0].color, '#00FF00');
assert.equal(session.levels[0].width, 5);
assert.equal(session.levels[0].label, 'J');
assert.match(levels.exportJson(session), /2026-08-15-WDO-R1/);
assert.match(levels.exportCsv(session), /sessionId;asset;event/);
console.log('levels-session: todos os testes passaram');
