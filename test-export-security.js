const assert = require('assert');
const levels = require('./levels-session.js');

const session = levels.createSession('SECURITY');
levels.addLevels(session, [
  { asset: 'WDO', event: 'OC1', roundId: 'R1', levelId: 'OC1_MEDIA', type: 'OC1', label: 'OC1 MEDIA', price: 5212.4, color: '#B000FF', width: 2 },
  { asset: 'WIN', event: 'WID_EWZ_VAR', roundId: 'R1', levelId: 'WID_JUSTO', type: 'WID', label: 'WID JUSTO EWZ VAR', price: 170000, color: '#00E676', width: 2 },
  { asset: 'WDO', event: 'PTAX', roundId: 'PX1', levelId: 'CENTER', type: 'PTAX', label: 'PX1 CENTRO', price: 5210.5, color: '#FF1493', width: 2 }
]);

const groovy = levels.exportTrydIndicator(session);
const ntsl = levels.exportProfitNtsl(session);
for (const output of [groovy, ntsl]) {
  assert.ok(output.includes('5212.4000') || output.includes('5212.4'));
  assert.ok(output.includes('OC1 MEDIA'));
  assert.ok(output.includes('WID JUSTO EWZ VAR'));
  assert.ok(output.includes('Plot') || output.includes('newLineData'));
  assert.ok(!/calculateWdo|calculateWin|roundHalf|Math\.sqrt|beta|alpha|paramAb|frp0Ptax/i.test(output));
}
assert.ok(groovy.includes('setColor(176, 0, 255)'));
assert.ok(ntsl.includes('#B000FF'));
assert.ok(ntsl.includes('SetPlotColor'));
assert.ok(ntsl.includes('SetPlotWidth'));
assert.ok(groovy.includes('getInput_Double'));
console.log('export-security: visual-only Groovy/NTSL OK');
