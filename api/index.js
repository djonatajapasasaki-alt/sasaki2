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

function hash(s) { return crypto.createHash('sha256').update(s + 'sasaki-salt').digest('hex'); }
function token() { return crypto.randomBytes(32).toString('hex'); }

async function db(method, path, body) {
  try {
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
    return await r.json();
  } catch (e) {
    return [];
  }
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

app.get('/health', (req, res) => res.json({ status: 'ok', versao: '4.0' }));

module.exports = app;
