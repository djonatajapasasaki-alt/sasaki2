(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SasakiInput = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PROFILES = {
    decimal: { scale: 1, decimals: 4 },
    dollar_quote: { scale: 1000, decimals: 2, min: 0 },
    dollar_points: { scale: 1, decimals: 2, min: 0 },
    cme: { scale: 1, decimals: 4, min: 0 },
    eur_usd: { scale: 1, decimals: 4, min: 0 },
    percent: { scale: 1, decimals: 4 },
    win_points: { scale: 1, decimals: 0, min: 0 },
    ptax: { scale: 1, decimals: 2, min: 0 },
    frp0: { scale: 1, decimals: 2 },
  };

  function cleanText(value) {
    return String(value == null ? '' : value)
      .trim()
      .replace(/\s+/g, '')
      .replace(/R\$/gi, '')
      .replace(/%/g, '');
  }

  function parseLocaleNumber(value) {
    const raw = cleanText(value);
    if (!raw) return { ok: false, error: 'Valor vazio.' };
    const lastComma = raw.lastIndexOf(',');
    const lastDot = raw.lastIndexOf('.');
    let normalized = raw;
    if (lastComma >= 0 && lastDot >= 0) {
      const decimalSeparator = lastComma > lastDot ? ',' : '.';
      const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
      normalized = raw.split(thousandsSeparator).join('').replace(decimalSeparator, '.');
    } else if (lastComma >= 0) {
      const decimals = raw.length - lastComma - 1;
      normalized = decimals <= 4 ? raw.replace(',', '.') : raw.replace(/,/g, '');
    } else if (lastDot >= 0) {
      const decimals = raw.length - lastDot - 1;
      normalized = decimals <= 4 ? raw : raw.replace(/\./g, '');
    }
    const hasThousandsSeparators = lastComma >= 0 && lastDot >= 0;
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
      return { ok: false, error: 'Formato numérico inválido.' };
    }
    const number = Number(normalized);
    if (!Number.isFinite(number)) return { ok: false, error: 'Número inválido.' };
    return { ok: true, source: raw, number, hasThousandsSeparators };
  }

  function normalize(value, profileName) {
    const profile = PROFILES[profileName];
    if (!profile) return { ok: false, error: 'Perfil de campo desconhecido.' };
    const parsed = parseLocaleNumber(value);
    if (!parsed.ok) return parsed;
    const effectiveScale = parsed.hasThousandsSeparators ? 1 : profile.scale;
    const converted = parsed.number * effectiveScale;
    if (profile.min != null && converted < profile.min) {
      return { ok: false, error: 'O valor não pode ser negativo.', source: parsed.source };
    }
    const rounded = Number(converted.toFixed(profile.decimals));
    return {
      ok: true,
      profile: profileName,
      source: parsed.source,
      value: rounded,
      display: rounded.toLocaleString('pt-BR', {
        minimumFractionDigits: profile.decimals,
        maximumFractionDigits: profile.decimals,
      }),
      changed: rounded !== parsed.number,
    };
  }

  function preview(value, profileName) {
    const result = normalize(value, profileName);
    if (!result.ok) return result;
    return Object.assign(result, {
      message: result.changed
        ? `Interpretado como ${result.display}.`
        : `Valor aceito: ${result.display}.`,
    });
  }

  return { profiles: PROFILES, parseLocaleNumber, normalize, preview };
});
