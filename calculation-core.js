(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SasakiCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function roundHalf(value) {
    return value >= 0 ? Math.round(value * 2 + 0.4999999) / 2 : -Math.round(Math.abs(value) * 2 - 0.4999999) / 2;
  }

  function roundTick(value, tick) {
    return Math.round(value / tick) * tick;
  }

  function wdoJusto(fechamento, varDxy) {
    return roundHalf(fechamento * (1 + varDxy / 100));
  }

  function wdoJustissimo(eurBrl, eurUsd, frp0) {
    const normalizedEurUsd = eurUsd > 10 ? eurUsd / 1000 : eurUsd;
    return roundHalf((eurBrl / normalizedEurUsd) + frp0);
  }

  function wdoBands(center, percent) {
    const max = roundHalf(center * (1 + percent / 100));
    const min = roundHalf(center * (1 - percent / 100));
    return { center: roundHalf(center), max, min, stressMax: max + 10, stressMin: min - 10 };
  }

  function ptaxRound(ptax, frp0, percent) {
    const center = roundHalf(ptax + frp0);
    return Object.assign({ ptax, frp0, percent }, wdoBands(center, percent));
  }

  function winBands(justo, vix) {
    const dailyVol = vix / Math.sqrt(252) / 100;
    return { just: justo, max: justo * (1 + dailyVol), min: justo * (1 - dailyVol), dailyVol };
  }

  function grade(center, levels, tick) {
    return levels.map((level) => ({
      label: level.label,
      type: level.tipo,
      percent: level.pct,
      points: Math.abs(level.pct) * center,
      price: roundTick(center * (1 + level.pct), tick),
    }));
  }

  return { roundHalf, roundTick, wdoJusto, wdoJustissimo, wdoBands, ptaxRound, winBands, grade };
});
