import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, setting } from './db.js';
import { digest, makeToken, hashPassword, checkPassword } from './security.js';
import {
  registerSchema,
  loginSchema,
  requestSchema,
  offerSchema,
  systemSchema,
  statusSchema,
  testimonialsSchema,
} from './validation.js';
import { normalizeWebhook, processWebhook } from './hotmart.js';
import { publicTestimonials } from './testimonials.js';
const app = express();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.env.APP_ORIGIN || 'http://127.0.0.1:5173';
const production = process.env.NODE_ENV === 'production';
if (!process.env.DATABASE_URL)
  throw new Error('Configure DATABASE_URL em server/.env antes de iniciar o servidor.');
if (production && !origin.startsWith('https://'))
  throw new Error('APP_ORIGIN deve usar HTTPS em produção.');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'https:', 'data:'],
        'frame-src': ['https:'],
        'connect-src': ["'self'"],
        'upgrade-insecure-requests': production ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos.' },
});
const requestLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Aguarde antes de enviar novas solicitações.' },
});
app.use('/api', async (req, res, next) => {
  try {
    const token = req.cookies.siteflow_session;
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      const { rows } = await pool.query(
        'SELECT u.id,u.name,u.email,u.role,u.email_verified FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW()',
        [digest(token)],
      );
      req.user = rows[0] || null;
    }
    next();
  } catch (e) {
    next(e);
  }
});
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
    req.path !== '/webhooks/hotmart' &&
    req.headers.origin !== origin
  )
    return res.status(403).json({ error: 'Origem não autorizada.' });
  next();
});
const auth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: 'Entre na sua conta.' });
const admin = (req, res, next) =>
  req.user?.role === 'admin'
    ? next()
    : res.status(403).json({ error: 'Acesso administrativo necessário.' });
const parse = (schema, value) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw Object.assign(new Error(parsed.error.issues[0].message), { status: 400 });
  return parsed.data;
};
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  emailVerified: u.email_verified,
});
async function createSession(user, res) {
  const token = makeToken();
  await pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES ($1,$2,$3)', [
    digest(token),
    user.id,
    new Date(Date.now() + 7 * 86400000),
  ]);
  res.cookie('siteflow_session', token, {
    httpOnly: true,
    secure: production,
    sameSite: 'lax',
    maxAge: 7 * 86400000,
    path: '/',
  });
}
app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});
app.get('/api/catalog', async (req, res) => {
  const { rows } = await pool.query('SELECT data FROM systems ORDER BY id');
  res.json({
    systems: rows.map((r) => r.data).filter((s) => req.user?.role === 'admin' || s.published),
    offer: { ...(await setting('offer')), mode: 'live' },
    categories: await setting('categories', ['Todos']),
    testimonials:
      req.user?.role === 'admin'
        ? await setting('testimonials', [])
        : publicTestimonials(await setting('testimonials', [])),
  });
});
app.get('/api/auth/me', (req, res) => res.json({ user: req.user ? publicUser(req.user) : null }));
app.post('/api/auth/register', authLimit, async (req, res) => {
  const f = parse(registerSchema, req.body);
  if (!process.env.SMTP_HOST)
    return res.status(503).json({
      error: 'Cadastro indisponível: a equipe precisa configurar a confirmação por e-mail.',
    });
  const passwordHash = await hashPassword(f.password);
  const result = await pool.query(
    'INSERT INTO users(id,name,email,password_hash) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id,name,email,role,email_verified',
    [randomUUID(), f.name, f.email, passwordHash],
  );
  const user = result.rows[0];
  if (!user)
    return res
      .status(409)
      .json({ error: 'Não foi possível cadastrar este e-mail. Tente entrar na sua conta.' });
  const token = makeToken();
  await pool.query('INSERT INTO email_tokens(token_hash,user_id,expires_at) VALUES($1,$2,$3)', [
    digest(token),
    user.id,
    new Date(Date.now() + 86400000),
  ]);
  const smtp = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  try {
    await smtp.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Confirme seu e-mail — SiteFlow',
      text: `Confirme seu e-mail para acessar sua conta SiteFlow: ${origin}/confirmar-email#${token}\nO link expira em 24 horas.`,
    });
  } catch (e) {
    await pool.query('DELETE FROM users WHERE id=$1', [user.id]);
    throw Object.assign(
      new Error('Não foi possível enviar a confirmação. Tente novamente mais tarde.'),
      { status: 503 },
    );
  }
  res.status(201).json({ verificationRequired: true });
});
app.post('/api/auth/verify', authLimit, async (req, res) => {
  const token = req.body.token;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token))
    return res.status(400).json({ error: 'Link inválido.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'DELETE FROM email_tokens WHERE token_hash=$1 AND expires_at>NOW() RETURNING user_id',
      [digest(token)],
    );
    if (!rows[0]) throw Object.assign(new Error('O link é inválido ou expirou.'), { status: 400 });
    await client.query('UPDATE users SET email_verified=TRUE WHERE id=$1', [rows[0].user_id]);
    await client.query(
      'UPDATE requests SET user_id=$1 WHERE email=(SELECT email FROM users WHERE id=$1) AND user_id IS NULL',
      [rows[0].user_id],
    );
    await client.query('COMMIT');
    res.json({ verified: true });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});
app.post('/api/auth/login', authLimit, async (req, res) => {
  const f = parse(loginSchema, req.body);
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [f.email]);
  const user = rows[0];
  const fallback =
    'ebc65462a51fcb0ebfdddb0e4ab61294:ee000c8e234b19a70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
  const valid = await checkPassword(f.password, user?.password_hash || fallback);
  if (!user || !valid) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  if (!user.email_verified)
    return res.status(403).json({ error: 'Confirme o e-mail para acessar sua conta.' });
  await pool.query('UPDATE requests SET user_id=$1 WHERE email=$2 AND user_id IS NULL', [
    user.id,
    user.email,
  ]);
  await createSession(user, res);
  res.json({ user: publicUser(user) });
});
app.post('/api/auth/logout', async (req, res) => {
  const token = req.cookies.siteflow_session;
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash=$1', [digest(token)]);
  res.clearCookie('siteflow_session', {
    path: '/',
    httpOnly: true,
    secure: production,
    sameSite: 'lax',
  });
  res.json({ ok: true });
});
app.post('/api/requests', requestLimit, async (req, res) => {
  const f = parse(requestSchema, req.body);
  const id = randomUUID();
  const userId = req.user?.email_verified && req.user.email === f.email ? req.user.id : null;
  await pool.query(
    'INSERT INTO requests(id,user_id,name,email,phone,business,type,model,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, userId, f.name, f.email, f.phone, f.business, f.type, f.model, f.description],
  );
  res.status(201).json({ id, status: 'Novo' });
});
app.get('/api/account', auth, async (req, res) => {
  const [r, o] = await Promise.all([
    pool.query('SELECT * FROM requests WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]),
    pool.query(
      'SELECT transaction,status,valid_until,auto_renew FROM orders WHERE email=$1 ORDER BY created_at DESC',
      [req.user.email],
    ),
  ]);
  res.json({ requests: r.rows, orders: req.user.email_verified ? o.rows : [] });
});
app.get('/api/admin/requests', admin, async (req, res) =>
  res.json((await pool.query('SELECT * FROM requests ORDER BY created_at DESC')).rows),
);
app.patch('/api/admin/requests/:id', admin, async (req, res) => {
  if (!/^[a-f0-9-]{36}$/.test(req.params.id))
    return res.status(400).json({ error: 'Solicitação inválida.' });
  const changes = parse(statusSchema, req.body);
  const { rows } = await pool.query(
    'UPDATE requests SET status=COALESCE($1,status),notes=COALESCE($2,notes) WHERE id=$3 RETURNING *',
    [changes.status, changes.notes, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Solicitação não encontrada.' });
  res.json(rows[0]);
});
app.get('/api/admin/systems', admin, async (req, res) =>
  res.json((await pool.query('SELECT data FROM systems ORDER BY id')).rows.map((r) => r.data)),
);
app.put('/api/admin/systems/:id', admin, async (req, res) => {
  const s = parse(systemSchema, req.body);
  if (s.id !== req.params.id) return res.status(400).json({ error: 'Identificador inválido.' });
  await pool.query(
    'INSERT INTO systems(id,data) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data',
    [s.id, JSON.stringify(s)],
  );
  res.json(s);
});
app.delete('/api/admin/systems/:id', admin, async (req, res) => {
  await pool.query('DELETE FROM systems WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});
app.put('/api/admin/offer', admin, async (req, res) => {
  const offer = { ...parse(offerSchema, req.body), mode: 'live' };
  if (offer.checkoutUrl) {
    const url = new URL(offer.checkoutUrl);
    if (!['pay.hotmart.com', 'payment.hotmart.com'].includes(url.hostname))
      throw Object.assign(new Error('Use um checkout oficial da Hotmart.'), { status: 400 });
  }
  await pool.query(
    'INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',
    ['offer', JSON.stringify(offer)],
  );
  res.json(offer);
});
app.put('/api/admin/categories', admin, async (req, res) => {
  const list = req.body.categories;
  if (
    !Array.isArray(list) ||
    list.length < 2 ||
    list.length > 50 ||
    list[0] !== 'Todos' ||
    list.some((c) => typeof c !== 'string' || c.length < 1 || c.length > 100)
  )
    return res.status(400).json({ error: 'Categorias inválidas.' });
  const unique = [...new Set(list)];
  await pool.query(
    'INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',
    ['categories', JSON.stringify(unique)],
  );
  res.json({ categories: unique });
});
app.put('/api/admin/testimonials', admin, async (req, res) => {
  const { testimonials } = parse(testimonialsSchema, req.body);
  await pool.query(
    'INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',
    ['testimonials', JSON.stringify(testimonials)],
  );
  res.json({ testimonials });
});
app.get('/api/admin/customers', admin, async (req, res) =>
  res.json(
    (await pool.query('SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC'))
      .rows,
  ),
);
app.get('/api/admin/orders', admin, async (req, res) =>
  res.json(
    (
      await pool.query(
        'SELECT transaction,email,status,valid_until,auto_renew FROM orders ORDER BY created_at DESC',
      )
    ).rows,
  ),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
app.post('/api/admin/uploads', admin, upload.single('image'), async (req, res) => {
  const b = req.file?.buffer;
  if (!b) return res.status(400).json({ error: 'Selecione uma imagem.' });
  let ext;
  if (b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ext = 'png';
  else if (b[0] === 255 && b[1] === 216 && b[2] === 255) ext = 'jpg';
  else if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP')
    ext = 'webp';
  else return res.status(400).json({ error: 'Use PNG, JPG ou WebP.' });
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(root, 'server/storage/images');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), b, { flag: 'wx' });
  res.status(201).json({ url: `/uploads/${name}` });
});
app.post('/api/webhooks/hotmart', async (req, res) => {
  if (!process.env.HOTMART_HOTTOK)
    return res.status(503).json({ error: 'Integração não configurada.' });
  const offer = await setting('offer');
  const event = normalizeWebhook(req.body, req.get('X-HOTMART-HOTTOK'), {
    hottok: process.env.HOTMART_HOTTOK,
    productId: offer?.productId,
  });
  res.json(await processWebhook(pool, event));
});
app.use(
  '/uploads',
  express.static(path.join(root, 'server/storage/images'), { dotfiles: 'deny', index: false }),
);
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint não encontrado.' }));
app.use(express.static(path.join(root, 'dist')));
app.get(/.*/, (req, res) => res.sendFile(path.join(root, 'dist/index.html')));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
  if (status >= 500) console.error('Falha na API:', err.code || err.name);
  res.status(status).json({
    error: status < 500 ? err.message : 'Não foi possível concluir a operação. Tente novamente.',
  });
});
const server = app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () =>
  console.log(`API SiteFlow em http://127.0.0.1:${process.env.PORT || 3001}`),
);
async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
