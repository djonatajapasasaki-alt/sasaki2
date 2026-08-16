(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SasakiLevels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function key(level) {
    return [level.sessionId, level.asset, level.event || 'MANUAL', level.roundId || 'R0', level.levelId || '', level.type, level.label || ''].join('|');
  }

  function createSession(sessionId) {
    return { sessionId, frozen: false, levels: [] };
  }

  function addLevels(session, incoming) {
    if (session.frozen) return { session, added: [], kept: incoming.slice(), frozen: true };
    const existing = new Set(session.levels.map(key));
    const added = [];
    const kept = [];
    incoming.forEach((level) => {
      const normalized = Object.assign({}, level, { sessionId: session.sessionId });
      if (existing.has(key(normalized))) kept.push(normalized);
      else { session.levels.push(normalized); existing.add(key(normalized)); added.push(normalized); }
    });
    return { session, added, kept, frozen: false };
  }

  function freeze(session) { session.frozen = true; return session; }

  function exportJson(session) {
    return JSON.stringify({ sessionId: session.sessionId, frozen: session.frozen, levels: session.levels }, null, 2);
  }

  function exportCsv(session) {
    const header = ['sessionId','asset','event','roundId','type','label','price','percent','color','width'];
    const lines = [header.join(';')];
    session.levels.forEach((level) => lines.push(header.map((field) => String(level[field] == null ? '' : level[field]).replace(/;/g, ',')).join(';')));
    return lines.join('\n');
  }

  function exportTrydCsv(session) {
    const header = ['Ativo','Preco','Rotulo','Cor','Espessura','Evento','Rodada','Sessao'];
    const lines = [header.join(';')];
    session.levels.forEach((level) => lines.push([
      level.asset, level.price, level.label || level.type, level.color || '#FFFFFF', level.width || 1,
      level.event || '', level.roundId || '', level.sessionId || '',
    ].map((value) => String(value).replace(/;/g, ',')).join(';')));
    return lines.join('\n');
  }

  function exportProfitCsv(session) {
    const header = ['Ativo','Preco','Nome','CorHex','Largura','Evento','Rodada','Sessao'];
    const lines = [header.join(';')];
    session.levels.forEach((level) => lines.push([
      level.asset, level.price, level.label || level.type, level.color || '#FFFFFF', level.width || 1,
      level.event || '', level.roundId || '', level.sessionId || '',
    ].map((value) => String(value).replace(/;/g, ',')).join(';')));
    return lines.join('\n');
  }

  function rgb(hex) {
    const clean = String(hex || '#FFFFFF').replace('#', '').padEnd(6, 'F').slice(0, 6);
    return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
  }

  function exportProfitNtsl(session) {
    const levels = session.levels.slice(0, 99);
    const lines = [
      '// SASAKI WDO/WIN - indicador de níveis congelados',
      '// Profit/NTSL: cole no Editor de Estratégias como Estratégia de Indicadores.',
      '// Os valores são constantes da sessão exportada e não se movem durante o pregão.',
      'input',
      ...levels.map((level, index) => `  N${index + 1}(${Number(level.price).toFixed(4)});`),
      'var',
      '  i : Integer;',
      'begin',
    ];
    levels.forEach((level, index) => {
      const plot = index + 1;
      const [r, g, b] = rgb(level.color);
      lines.push(`  PlotN(${plot}, N${plot});`);
      lines.push(`  SetPlotColor(${plot}, RGB(${r},${g},${b}));`);
      lines.push(`  SetPlotWidth(${plot}, ${Math.max(1, Math.min(5, Number(level.width) || 1))});`);
    });
    lines.push('end;');
    return lines.join('\n');
  }

  function exportTrydGroovy(session) {
    const levels = session.levels.map((level) => ({
      price: Number(level.price), label: String(level.label || level.type || '').replace(/'/g, "\\'"),
      color: level.color || '#FFFFFF', width: Number(level.width) || 1,
    }));
    const payload = levels.map((level) => `    [price:${level.price}, label:'${level.label}', color:'${level.color}', width:${level.width}]`).join(',\n');
    return `import stScript.process.api.*\n\n/**\n * SASAKI - processo Tryd para níveis congelados.\n * Fonte oficial da API: stScript.process.api.Process/QuoteEvent.\n * Inicie em Janela > Mostrar Visões > Outros > Script > Processos de Script.\n * Este processo não envia ordens; apenas mantém os níveis da sessão e registra\n * o estado para o indicador/estudo gráfico da sua instalação do Tryd.\n */\nclass SasakiFrozenLevelsProcess extends Process {\n  def levels = [\n${payload}\n  ]\n\n  void onStart() {\n    logMessage('Sasaki: níveis congelados carregados: ' + levels.size())\n  }\n\n  void onQuoteEvent(QuoteEvent event) {\n    // O processo permanece passivo: as linhas são constantes e não são recalculadas.\n    // Use os valores de levels no estudo gráfico Groovy da sua versão do Tryd.\n  }\n\n  void onStop() {\n    logMessage('Sasaki: processo finalizado sem alterar níveis.')\n  }\n}\n`;
  }

  return { key, createSession, addLevels, freeze, exportJson, exportCsv, exportTrydCsv, exportProfitCsv, exportProfitNtsl, exportTrydGroovy };
});
