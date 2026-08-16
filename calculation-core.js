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

  function mean(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  function sampleStd(values, average) {
    if (values.length < 2) return 0;
    const variance = values.reduce((sum, value) => sum + ((value - average) ** 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  function impactRegression(rows, surpriseKey, pointsKey) {
    const pairs = (rows || []).map((row) => ({
      x: Number(row[surpriseKey]),
      y: Number(row[pointsKey]),
    })).filter((pair) => Number.isFinite(pair.x) && Number.isFinite(pair.y));
    const n = pairs.length;
    if (!n) return { n: 0, beta: 0, alpha: 0, r2: 0, surpriseMean: 0, pointsMean: 0, surpriseStd: 0, pointsStd: 0 };
    const xMean = mean(pairs.map((pair) => pair.x));
    const yMean = mean(pairs.map((pair) => pair.y));
    const sxx = pairs.reduce((sum, pair) => sum + ((pair.x - xMean) ** 2), 0);
    const syy = pairs.reduce((sum, pair) => sum + ((pair.y - yMean) ** 2), 0);
    const sxy = pairs.reduce((sum, pair) => sum + ((pair.x - xMean) * (pair.y - yMean)), 0);
    const beta = sxx ? sxy / sxx : 0;
    const alpha = yMean - beta * xMean;
    const r2 = sxx && syy ? (sxy * sxy) / (sxx * syy) : 0;
    return {
      n,
      beta,
      alpha,
      r2,
      surpriseMean: xMean,
      pointsMean: yMean,
      surpriseStd: sampleStd(pairs.map((pair) => pair.x), xMean),
      pointsStd: sampleStd(pairs.map((pair) => pair.y), yMean),
    };
  }

  function projectImpact(stats, surprise) {
    const x = Number(surprise);
    if (!stats || !Number.isFinite(x)) return 0;
    return Number(stats.alpha || 0) + Number(stats.beta || 0) * x;
  }

  return { roundHalf, roundTick, wdoJusto, wdoJustissimo, wdoBands, ptaxRound, winBands, grade, impactRegression, projectImpact };
});
