'use strict';

function roundHalf(value) {
  return value >= 0 ? Math.round(value * 2 + 0.4999999) / 2 : -Math.round(Math.abs(value) * 2 - 0.4999999) / 2;
}

function roundTick(value, tick) {
  return Math.round(value / tick) * tick;
}

const STYLES = {
  J: { color: '#FFFFFF', width: 2 },
  JJ: { color: '#FFFFFF', width: 2 },
  MAX: { color: '#83C7FF', width: 2 },
  MIN: { color: '#FF4D5A', width: 2 },
  CME: { color: '#FFD23F', width: 2 },
  OC1: { color: '#FF8A3D', width: 2 },
  BASE: { color: '#9B59FF', width: 2 },
  D1: { color: '#35D07F', width: 2 },
  D2: { color: '#35D07F', width: 2 },
  PX1: { color: '#FF62C4', width: 2 },
  PX2: { color: '#FF62C4', width: 2 },
  PX3: { color: '#FF62C4', width: 2 },
  GRADE_CENTER: { color: '#FFFFFF', width: 2 },
  GRADE_UP: { color: '#83C7FF', width: 2 },
  GRADE_DOWN: { color: '#FF4D5A', width: 2 },
  EWZ: { color: '#35D07F', width: 2 },
};

function style(type) { return STYLES[type] || { color: '#FFFFFF', width: 2 }; }
function number(value) {
  if (value === undefined || value === null || value === '') return NaN;
  const normalized = String(value).trim().replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}
function finite(value) { return Number.isFinite(Number(value)); }
function level(asset, event, roundId, levelId, type, label, price, extra = {}) {
  return Object.assign({ asset, event, roundId, levelId, type, label, price: Number(price) }, style(type), extra);
}

function calculateWin(input) {
  const fechamento = number(input.fechamento);
  const varSp500 = number(input.varSp500);
  const varMicro = number(input.varMicro);
  const vix = number(input.vix);
  if (![fechamento, varSp500, varMicro, vix].every(finite)) throw new Error('Preencha os campos obrigatórios do WIN.');
  const justo = roundHalf(fechamento * (1 + varSp500 / 100));
  const justissimo = roundHalf(justo * (1 + varMicro / 100));
  const vol = vix / Math.sqrt(252) / 100;
  const maxima = roundHalf(justo * (1 + vol));
  const minima = roundHalf(justo * (1 - vol));
  const levels = [
    level('WIN', 'CALCULO', 'R1', 'J', 'J', 'J JUSTO', justo),
    level('WIN', 'CALCULO', 'R1', 'JJ', 'JJ', 'JJ JUSTÍSSIMO', justissimo),
    level('WIN', 'CALCULO', 'R1', 'MAX', 'MAX', 'VIX MAX S&P', maxima),
    level('WIN', 'CALCULO', 'R1', 'MIN', 'MIN', 'VIX MIN S&P', minima),
  ];
  const ewzVar = number(input.ewzVar);
  const ewzQuote = number(input.ewzQuote);
  const widJusto = finite(ewzVar) ? roundHalf(fechamento * (1 + ewzVar / 100)) : NaN;
  if (finite(widJusto)) levels.push(level('WIN', 'WID_EWZ_VAR', 'R1', 'WID_J', 'EWZ', 'WID JUSTO EWZ VAR', widJusto));
  if (finite(ewzQuote) && finite(widJusto)) {
    const widVol = ewzQuote / Math.sqrt(252) / 100;
    levels.push(level('WIN', 'WID_EWZ_QUOTE', 'R1', 'WID_MAX', 'EWZ', 'WID MAX EWZ COTACAO', roundHalf(widJusto * (1 + widVol))));
    levels.push(level('WIN', 'WID_EWZ_QUOTE', 'R1', 'WID_MIN', 'EWZ', 'WID MIN EWZ COTACAO', roundHalf(widJusto * (1 - widVol))));
  }
  const vixIbov = number(input.vixIbov);
  if (finite(vixIbov)) {
    const volIbov = vixIbov / Math.sqrt(252) / 100;
    levels.push(level('WIN', 'VIX_IBOV', 'R1', 'MAX_IBOV', 'MAX', 'IBOV MAX VIX', roundHalf(justo * (1 + volIbov))));
    levels.push(level('WIN', 'VIX_IBOV', 'R1', 'MIN_IBOV', 'MIN', 'IBOV MIN VIX', roundHalf(justo * (1 - volIbov))));
  }
  return { asset: 'WIN', results: { justo, justissimo, maxima, minima, widJusto: finite(widJusto) ? widJusto : null }, levels };
}

function calculateWdo(input) {
  const fechamento = number(input.fechamento);
  const varDxy = number(input.varDxy);
  const eurBrl = number(input.eurBrl);
  const eurUsdInput = number(input.eurUsd);
  const frp0 = number(input.frp0);
  if (![fechamento, varDxy, eurBrl, eurUsdInput, frp0].every(finite)) throw new Error('Preencha os campos obrigatórios do WDO.');
  const justo = roundHalf(fechamento * (1 + varDxy / 100));
  const maxJusto = roundHalf(justo * (1 + 0.5 / 100));
  const minJusto = roundHalf(justo * (1 - 0.5 / 100));
  const eurUsd = eurUsdInput > 10 ? eurUsdInput / 1000 : eurUsdInput;
  const justissimo = roundHalf((eurBrl / eurUsd) + frp0);
  const levels = [
    level('WDO', 'CALCULO', 'R1', 'J', 'J', 'J JUSTO', justo),
    level('WDO', 'CALCULO', 'R1', 'JJ', 'JJ', 'JJ JUSTÍSSIMO', justissimo),
    level('WDO', 'CALCULO', 'R1', 'MAX', 'MAX', 'WDO MAX JUSTO', maxJusto),
    level('WDO', 'CALCULO', 'R1', 'MIN', 'MIN', 'WDO MIN JUSTO', minJusto),
  ];
  const casado = finite(number(input.casado)) ? number(input.casado) : 0;
  const paramAb = number(input.paramAb);
  const oc1 = { fech: number(input.oc1Fech), acordo: number(input.oc1Acordo), alto: number(input.oc1Alto), baixo: number(input.oc1Baixo) };
  Object.entries(oc1).forEach(([name, value]) => {
    if (!finite(value)) return;
    const realValue = value > 100 ? value : value * 1000;
    levels.push(level('WDO', 'OC1', 'R1', `OC1_${name.toUpperCase()}`, 'OC1', `OC1 ${name.toUpperCase()}`, roundHalf(realValue + casado)));
  });
  if (finite(paramAb)) {
    const base = paramAb > 100 ? paramAb : paramAb * 1000;
    levels.push(level('WDO', 'BASE', 'R1', 'COM_CASADO', 'BASE', 'BASE COM CASADO', roundHalf(base + casado)));
    levels.push(level('WDO', 'BASE', 'R1', 'COM_FRP0', 'BASE', 'BASE COM FRP0', roundHalf(base + frp0)));
    levels.push(level('WDO', 'BASE', 'R1', 'SEM_AJUSTE', 'BASE', 'BASE SEM AJUSTE', roundHalf(base)));
  }
  const spotD2 = number(input.spotD2);
  const spotD1 = number(input.spotD1);
  if (finite(spotD2)) levels.push(level('WDO', 'SONHO', 'R1', 'D2', 'D2', 'D2 SONHO', roundHalf((spotD2 > 100 ? spotD2 : spotD2 * 1000) + casado)));
  if (finite(spotD1)) levels.push(level('WDO', 'SONHO', 'R1', 'D1', 'D1', 'D1 SONHO', roundHalf((spotD1 > 100 ? spotD1 : spotD1 * 1000) + casado)));
  const cme = { durar: number(input.cmeDurar), acordo: number(input.cmeAcordo), alto: number(input.cmeAlto), baixo: number(input.cmeBaixo), abrir: number(input.cmeAbrir) };
  Object.entries(cme).forEach(([name, value]) => {
    if (!finite(value) || value <= 0) return;
    levels.push(level('WDO', 'CME', 'R1', `CME_${name.toUpperCase()}`, 'CME', `CME ${name.toUpperCase()}`, roundHalf(1000 / value)));
  });
  const ptax = [number(input.ptax1), number(input.ptax2), number(input.ptax3)];
  const ptaxFrp0 = [number(input.frp0Ptax1), number(input.frp0Ptax2), number(input.frp0Ptax3)];
  ptax.forEach((value, index) => {
    if (!finite(value) || value === 0) return;
    const ownFrp0 = finite(ptaxFrp0[index]) ? ptaxFrp0[index] : frp0;
    const pct = index < 2 ? 0.5 : 0.38;
    const center = roundHalf(value + ownFrp0);
    const px = `PX${index + 1}`;
    levels.push(level('WDO', 'PTAX', px, 'CENTER', px, `${px} CENTRO`, center));
    levels.push(level('WDO', 'PTAX', px, 'MAX', 'MAX', `WDO ${px} MAX +${pct.toFixed(2).replace('.', ',')}%`, roundHalf(center * (1 + pct / 100)), { percent: pct }));
    levels.push(level('WDO', 'PTAX', px, 'MIN', 'MIN', `WDO ${px} MIN -${pct.toFixed(2).replace('.', ',')}%`, roundHalf(center * (1 - pct / 100)), { percent: -pct }));
    levels.push(level('WDO', 'PTAX', px, 'STRESS_MAX', 'MAX', `WDO ${px} STRESS MAX`, roundHalf(center * (1 + pct / 100)) + 10));
    levels.push(level('WDO', 'PTAX', px, 'STRESS_MIN', 'MIN', `WDO ${px} STRESS MIN`, roundHalf(center * (1 - pct / 100)) - 10));
  });
  return { asset: 'WDO', results: { justo, justissimo, maxJusto, minJusto }, levels };
}

const WIN_GRADE = [
  [0.05338,'Notícias','noticias'],[0.04956,'Notícias','noticias'],[0.04574,'Notícias','noticias'],[0.04192,'Notícias','noticias'],[0.03820,'Notícias','noticias'],[0.03438,'Notícias','noticias'],[0.03056,'Notícias','noticias'],[0.02674,'Notícias','noticias'],[0.02292,'Notícias','noticias'],[0.01910,'EXTREMO','extremo'],[0.01528,'P. SE LIGA','pselliga'],[0.01146,'PB','pb'],[0.00764,'P. IMPORT.','pimp'],[0.00382,'','noticias'],[0,'ABERTURA','abertura'],[-0.00382,'','noticias'],[-0.00764,'P. IMPORT.','pimp'],[-0.01146,'PB','pb'],[-0.01528,'P. SE LIGA','pselliga'],[-0.01910,'EXTREMO','extremo'],[-0.02292,'Notícias','noticias'],[-0.02674,'Notícias','noticias'],[-0.03056,'Notícias','noticias'],[-0.03438,'Notícias','noticias'],[-0.03820,'Notícias','noticias'],[-0.04192,'Notícias','noticias'],[-0.04574,'Notícias','noticias'],[-0.04956,'Notícias','noticias'],[-0.05338,'Notícias','noticias']
];
const WDO_GRADE = [
  [0.0165,'Notícias','noticias'],[0.0150,'Notícias','noticias'],[0.0135,'Notícias','noticias'],[0.0120,'EXTREMO','extremo'],[0.0100,'P. SE LIGA','pselliga'],[0.0095,'P. IMPORT.','pimp'],[0.0080,'P. IMPORT.','pimp'],[0.0075,'P. IMPORT.','pimp'],[0.0065,'P. IMPORT.','pimp'],[0.0050,'P.PB','pb'],[0.0040,'','noticias'],[0.0035,'P. IMPORT.','pimp'],[0.0025,'P. BAIXA VOL','pbaixa'],[0,'ABERTURA','abertura'],[-0.0025,'P. BAIXA VOL','pbaixa'],[-0.0035,'P. IMPORT.','pimp'],[-0.0040,'','noticias'],[-0.0050,'P.PB','pb'],[-0.0065,'P. IMPORT.','pimp'],[-0.0075,'P. IMPORT.','pimp'],[-0.0080,'P. IMPORT.','pimp'],[-0.0095,'P. IMPORT.','pimp'],[-0.0100,'P. SE LIGA','pselliga'],[-0.0120,'EXTREMO','extremo'],[-0.0135,'Notícias','noticias'],[-0.0150,'Notícias','noticias'],[-0.0165,'Notícias','noticias']
];
function calculateGrade(asset, center) {
  const base = number(center);
  if (!finite(base)) throw new Error('Informe o centro da grade.');
  const source = asset === 'WIN' ? WIN_GRADE : asset === 'WDO' ? WDO_GRADE : null;
  if (!source) throw new Error('Ativo inválido para grade.');
  return source.map(([pct, label, type], index) => {
    const price = asset === 'WIN' ? Math.round(base * (1 + pct)) : roundTick(base * (1 + pct), 0.5);
    const styleType = pct === 0 ? 'GRADE_CENTER' : pct > 0 ? 'GRADE_UP' : 'GRADE_DOWN';
    return level(asset, 'GRADE', 'R1', `${type}:${pct}`, styleType, label, price, { percent: pct * 100, gradeType: type, levelIndex: index });
  });
}

module.exports = { calculateWin, calculateWdo, calculateGrade, STYLES };
