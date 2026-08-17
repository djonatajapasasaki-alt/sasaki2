'use strict';
const assert = require('assert');
const { calculateWin, calculateWdo, calculateGrade } = require('./api/protected-engine');

const win = calculateWin({ fechamento: '174080', varSp500: '0.12', varMicro: '0.11', vix: '19.28', ewzVar: '0.50', ewzQuote: '25.00', vixIbov: '19.28' });
assert.strictEqual(win.asset, 'WIN');
assert.ok(win.levels.length >= 7);
assert.ok(win.levels.every((level) => Number.isFinite(level.price)));
assert.ok(win.levels.every((level) => typeof level.label === 'string' && level.label.length > 0));
assert.ok(win.levels.every((level) => typeof level.color === 'string' && Number.isFinite(level.width)));
assert.strictEqual(win.levels.find((level) => level.levelId === 'J').color, '#FFFFFF');
assert.strictEqual(win.levels.find((level) => level.levelId === 'MAX').color, '#83C7FF');
assert.strictEqual(win.levels.find((level) => level.levelId === 'MIN').color, '#FF1744');

const wdo = calculateWdo({
  fechamento: '5417.20', varDxy: '-0.50', eurBrl: '5.9737', eurUsd: '1.1435', frp0: '18.10', casado: '10.68',
  paramAb: '5.0693', spotD2: '5.0890', spotD1: '5.0868', oc1Fech: '5.0715', oc1Acordo: '0.19605', oc1Alto: '5.0968', oc1Baixo: '5.0515', cmeDurar: '0.1523',
  ptax1: '5283.00', frp0Ptax1: '18.10'
});
assert.strictEqual(wdo.asset, 'WDO');
assert.ok(wdo.levels.some((level) => level.event === 'PTAX' && level.roundId === 'PX1'));
assert.ok(wdo.levels.some((level) => level.event === 'OC1'));
assert.ok(wdo.levels.some((level) => level.event === 'BASE'));
assert.ok(wdo.levels.some((level) => level.event === 'SONHO'));
assert.ok(wdo.levels.some((level) => level.event === 'CME'));
assert.ok(wdo.levels.every((level) => Number.isFinite(level.price)));

assert.throws(() => calculateWin({ fechamento: '174080' }), /campos obrigatórios/);
assert.throws(() => calculateWdo({ fechamento: '5417.20' }), /campos obrigatórios/);

const winGrade = calculateGrade('WIN', '174000');
const wdoGrade = calculateGrade('WDO', '5417.50');
assert.strictEqual(winGrade.length, 29);
assert.strictEqual(wdoGrade.length, 27);
assert.strictEqual(winGrade.find((level) => level.percent === 0).color, '#FFFFFF');
assert.strictEqual(winGrade.find((level) => level.percent > 0).color, '#83C7FF');
assert.strictEqual(winGrade.find((level) => level.percent < 0).color, '#FF1744');
assert.ok(winGrade.every((level) => level.width === 2));
assert.ok(wdoGrade.every((level) => level.width === 2));

console.log('protected-engine: OK');
