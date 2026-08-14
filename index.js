const express = require('express');
const express = require('express');
const crypto = require('crypto');
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
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnanN6Y3pvYWtudHN3amhtenNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDY0ODMsImV4cCI6MjA5ODM4MjQ4M30.EynPilNZXamRAy1DvYAEfLKUBnDLnGelTnSKzvgzwQw';
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
  const { fechamento, var_sp500, var_micro, vix, vxbrl } = req.body;
  if ([fechamento, var_sp500, var_micro, vix, vxbrl].some(v => typeof v !== 'number' || isNaN(v)))
    return res.json({ error: 'Dados inválidos.' });
  const R = Math.sqrt(252);
  const justo = fechamento * (1 + var_sp500 / 100);
  const justissimo = fechamento * (1 + var_micro / 100);
  const vol = vix / R;
  const vol_brl = vxbrl / R;
  res.json({ 
    justo, 
    justissimo, 
    maxima: justo * (1 + vol / 100), 
    minima: justo * (1 - vol / 100),
    vxbrl_maxima: justo * (1 + vol_brl / 100),
    vxbrl_minima: justo * (1 - vol_brl / 100)
  });
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

// Rotas de Histórico Macro e Calibração Automática de Fatores
app.get('/macro/historico', auth, async (req, res) => {
  try {
    const data = await db('macro_historico').select('*').order('data', { ascending: false });
    res.json(data || []);
  } catch (e) {
    // Se a tabela ainda nao existir, retorna array vazio
    res.json([]);
  }
});

app.post('/macro/historico', auth, async (req, res) => {
  try {
    const { data, evento, consenso, real, wdo_pontos, win_pontos } = req.body;
    if (!data || !evento || isNaN(consenso) || isNaN(real)) {
      return res.status(400).json({ error: 'Dados incompletos.' });
    }
    const desvio = real - consenso;
    // Fator calculado: pontos reais / (desvio / 10000)
    const lotes = desvio / 10000;
    const fator_wdo = lotes !== 0 ? (wdo_pontos / lotes) : 3.5;
    const fator_win = lotes !== 0 ? (win_pontos / lotes) : 150;

    const record = {
      data,
      evento,
      consenso,
      real,
      desvio,
      wdo_pontos: wdo_pontos || 0,
      win_pontos: win_pontos || 0,
      fator_wdo: Math.abs(fator_wdo),
      fator_win: Math.abs(fator_win),
      criado_em: new Date().toISOString()
    };

    await db('macro_historico').insert(record);
    res.json({ success: true, record });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar histórico: ' + e.message });
  }
});

app.get('/macro/fatores', auth, async (req, res) => {
  try {
    // Filtrar ultimos 365 dias (janela movel de 1 ano)
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
    
    const registros = await db('macro_historico')
      .select('*')
      .gte('data', umAnoAtras.toISOString().split('T')[0]);

    if (!registros || registros.length === 0) {
      return res.json({ fator_wdo: 3.5, fator_win: 150, amostras: 0 });
    }

    const somaWdo = registros.reduce((acc, r) => acc + (r.fator_wdo || 3.5), 0);
    const somaWin = registros.reduce((acc, r) => acc + (r.fator_win || 150), 0);

    res.json({
      fator_wdo: Number((somaWdo / registros.length).toFixed(2)),
      fator_win: Number((somaWin / registros.length).toFixed(1)),
      amostras: registros.length
    });
  } catch (e) {
    res.json({ fator_wdo: 3.5, fator_win: 150, amostras: 0 });
  }
});

module.exports = app;
