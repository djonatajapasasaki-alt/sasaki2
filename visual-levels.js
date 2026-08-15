(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SasakiVisualLevels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STYLES = {
    J: { label: 'J', name: 'Justo', color: '#FFFFFF', width: 2 },
    JJ: { label: 'JJ', name: 'Justíssimo', color: '#FFFFFF', width: 2 },
    MAX: { label: 'MAX', name: 'Máxima', color: '#83C7FF', width: 1 },
    MIN: { label: 'MIN', name: 'Mínima', color: '#FF4D5A', width: 1 },
    CME: { label: 'CME', name: 'CME', color: '#FFD23F', width: 1 },
    OC1: { label: 'OC1', name: 'OC1', color: '#FF8A3D', width: 1 },
    BAS: { label: 'BAS', name: 'Base', color: '#9B59FF', width: 1 },
    D1: { label: 'D1', name: 'D1', color: '#35D07F', width: 1 },
    D2: { label: 'D2', name: 'D2', color: '#35D07F', width: 1 },
    PX1: { label: 'PX1', name: 'PTAX 01', color: '#FF62C4', width: 1 },
    PX2: { label: 'PX2', name: 'PTAX 02', color: '#FF62C4', width: 1 },
    PX3: { label: 'PX3', name: 'PTAX 03', color: '#FF62C4', width: 1 },
  };

  function styleFor(type) { return STYLES[type] || { label: type, name: type, color: '#B0B0C0', width: 1 }; }
  function labelFor(type, price, percent) {
    const style = styleFor(type);
    const pct = percent == null || percent === 0 ? '' : ` ${percent > 0 ? '+' : ''}${Number(percent).toFixed(2).replace('.', ',')}%`;
    return `${style.label}${pct} ${Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return { STYLES, styleFor, labelFor };
});
