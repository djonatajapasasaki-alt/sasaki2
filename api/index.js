const crypto = require('crypto');

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || '';
  const method = req.method;

  if (url.includes('/health')) {
    return res.status(200).json({ status: 'ok', versao: '4.0' });
  }

  if (url.includes('/auth/login') && method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      }
      const { email, senha } = body;
      if (!email || !senha) return res.status(200).json({ error: 'E-mail e senha obrigatórios.' });
      const rows = await db('GET', `usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`);
      const user = rows[0];
      if (!user || user.senha_hash !== hash(senha)) return res.status(200).json({ error: 'E-mail ou senha incorretos.' });
      if (!user.ativo) return res.status(200).json({ error: 'Assinatura inativa.' });
      const tk = token();
      await db('PATCH', `usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}`, { token: tk });
      return res.status(200).json({ email: user.email, ativo: user.ativo, token: tk });
    } catch (e) {
      return res.status(200).json({ error: 'Erro interno: ' + e.message });
    }
  }

  if (url.includes('/auth/check') && method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      }
      const { token: tk } = body;
      if (!tk) return res.status(200).json({ valid: false });
      const rows = await db('GET', `usuarios?token=eq.${encodeURIComponent(tk)}&select=*`);
      const user = rows[0];
      if (!user) return res.status(200).json({ valid: false });
      return res.status(200).json({ valid: true, email: user.email, ativo: user.ativo, token: user.token });
    } catch (e) {
      return res.status(200).json({ valid: false });
    }
  }

  return res.status(200).json({ status: 'active', url });
}
