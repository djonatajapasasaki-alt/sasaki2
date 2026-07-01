const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const SUPABASE_URL = 'https://jgjszczoakntswjhmzse.supabase.co';
const SUPABASE_KEY = 'sb_secret_cjW_klDf3qBPKE3i-1sXJQ_Hj6iV70P';
const ADMIN_KEY = process.env.ADMIN_KEY || 'SasakiAdmin2025';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'SasakiWebhook2025';

function hash(s) { return crypto.createHash('sha256').update(s + 'sasaki-salt').digest('hex'); }
function token() { return crypto.randomBytes(32).toString('hex'); }

async function db(method, path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return r.json();
}

app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.json({ error: 'E-mail e senha obrigatórios.' });
    const rows = await db('GET', `usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`);
    const user = rows[0];
    if (!user || user.senha_hash !== hash(senha)) return res.json({ error: 'E-mail ou senha incorretos.' });
    if (!user.ativo) return res.json({ error: 'Assinatura inativa.' });
    const tk = token();
    await db('PATCH', `usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}`, { token: tk });
    res.json({ email: user.email, ativo: user.ativo, token: tk });
  } catch (e) { res.json({ error: 'Erro interno: ' + e.message }); }
});

app.post('/auth/check', async (req, res) => {
  try {
    const { token: tk } = req.body;
    if (!tk) return res.json({ valid: false });
    const rows = await db('GET', `usuarios?token=eq.${encodeURIComponent(tk)}&select=*`);
    const user = rows[0];
    if (!user) return res.json({ valid: false });
    res.json({ valid: true, email: user.email, ativo: user.ativo, token: user.token });
  } catch (e) { res.json({ valid: false }); }
});

async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization;
    if (!hdr || !hdr.startsWith('Bearer ')) return res.status(401).json({ error: 'Não autorizado.' });
    const tk = hdr.replace('Bearer ', '');
    const rows = await db('GET', `usuarios?token=eq.${encodeURIComponent(tk)}&select=*`);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Sessão inválida.' });
    if (!user.ativo) return res.status(403).json({ error: 'Assinatura inativa.' });
    req.user = user;
    next();
  } catch (e) { res.status(401).json({ error: 'Erro de auth.' }); }
}

app.post('/calcular', auth, (req, res) => {
  const { fechamento, var_sp500, var_micro, vix } = req.body;
  if ([fechamento, var_sp500, var_micro, vix].some(v => typeof v !== 'number' || isNaN(v)))
    return res.json({ error: 'Dados inválidos.' });
  const R = Math.sqrt(252);
  const justo = fechamento * (1 + var_sp500 / 100);
  const justissimo = fechamento * (1 + var_micro / 100);
  const vol = vix / R;
  res.json({ justo, justissimo, maxima: justo * (1 + vol / 100), minima: justo * (1 - vol / 100) });
});

app.post('/webhook/kiwify', async (req, res) => {
  if (req.headers['x-webhook-secret'] !== WEBHOOK_SECRET) return res.status(401).json({ error: 'Não autorizado.' });
  const { evento, email, order_id } = req.body;
  if (!email) return res.json({ ok: false });
  const k = email.toLowerCase();
  if (evento === 'assinatura_ativa') {
    const rows = await db('GET', `usuarios?email=eq.${encodeURIComponent(k)}&select=email`);
    if (!rows[0]) {
      const s = order_id ? order_id.slice(0, 8) : 'Sasaki01';
      await db('POST', 'usuarios', { email: k, senha_hash: hash(s), ativo: true, kiwify_order_id: order_id || null });
    } else {
      await db('PATCH', `usuarios?email=eq.${encodeURIComponent(k)}`, { ativo: true });
    }
    return res.json({ ok: true, acao: 'acesso_liberado' });
  }
  if (['reembolso', 'chargeback', 'cancelamento'].includes(evento)) {
    await db('PATCH', `usuarios?email=eq.${encodeURIComponent(k)}`, { ativo: false, token: null });
    return res.json({ ok: true, acao: 'acesso_bloqueado' });
  }
  res.json({ ok: true });
});

app.post('/admin/criar-usuario', async (req, res) => {
  const { admin_key, email, senha } = req.body;
  if (admin_key !== ADMIN_KEY) return res.status(403).json({ error: 'Não autorizado.' });
  const rows = await db('GET', `usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}&select=email`);
  if (rows[0]) {
    await db('PATCH', `usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}`, { senha_hash: hash(senha), ativo: true });
  } else {
    await db('POST', 'usuarios', { email: email.toLowerCase(), senha_hash: hash(senha), ativo: true });
  }
  res.json({ ok: true, email });
});

app.get('/health', (req, res) => res.json({ status: 'ok', versao: '4.0' }));

module.exports = app;
