const assert = require('node:assert/strict');
const calc = require('./calculation-core.js');

assert.equal(calc.roundHalf(5125.24), 5125.5);
assert.equal(calc.roundHalf(5125.26), 5125.5);
assert.equal(calc.roundTick(5125.24, 0.5), 5125);
assert.equal(calc.roundTick(5125.26, 0.5), 5125.5);
assert.equal(calc.wdoJusto(5302, -0.5), 5275.5);
assert.equal(calc.wdoJustissimo(5973.7, 1.1435, 18.1), 5242.5);
const ptax = calc.ptaxRound(5283, 18.1, 0.5);
assert.equal(ptax.center, 5301.5);
assert.equal(ptax.max, 5328.5);
assert.equal(ptax.min, 5275);
assert.equal(ptax.stressMax, 5338.5);
assert.equal(ptax.stressMin, 5265);
const levels = calc.grade(5301, [{label:'J', tipo:'justo', pct:0}, {label:'MAX', tipo:'max', pct:0.005}], 0.5);
assert.equal(levels[0].price, 5301);
assert.equal(levels[1].price, 5327.5);
console.log('calculation-core: todos os testes passaram');
