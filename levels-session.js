(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SasakiLevels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function key(level) {
    return [level.sessionId, level.asset, level.event || 'MANUAL', level.roundId || 'R0', level.type, level.price].join('|');
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

  return { key, createSession, addLevels, freeze, exportJson, exportCsv };
});
