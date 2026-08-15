const assert = require('node:assert/strict');
const input = require('./input-normalizer.js');

function value(text, profile) {
  const result = input.normalize(text, profile);
  assert.equal(result.ok, true, `${text} deveria ser aceito`);
  return result.value;
}

assert.equal(value('5,1253', 'dollar_quote'), 5125.3);
assert.equal(value('5.125,30', 'dollar_quote'), 5125.3);
assert.equal(value('0,1523', 'cme'), 0.1523);
assert.equal(value('1,1435', 'eur_usd'), 1.1435);
assert.equal(value('0,50%', 'percent'), 0.5);
assert.equal(value('174080', 'win_points'), 174080);
assert.equal(value('5283,00', 'ptax'), 5283);
assert.equal(value('18,10', 'frp0'), 18.1);
assert.equal(input.normalize('-1', 'ptax').ok, false);
assert.equal(input.normalize('abc', 'cme').ok, false);
console.log('input-normalizer: todos os testes passaram');
