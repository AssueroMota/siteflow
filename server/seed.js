import { randomUUID } from 'node:crypto';
import { pool } from './db.js';
import { initialSystems, initialOffer, categories } from '../src/data/catalog.js';
import { hashPassword } from './security.js';
try {
  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD.length < 12
  )
    throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo de 12 caracteres) no ambiente.');
  await pool.query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
    'offer',
    JSON.stringify({ ...initialOffer, mode: 'live' }),
  ]);
  await pool.query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
    'categories',
    JSON.stringify(categories),
  ]);
  for (const s of initialSystems)
    await pool.query('INSERT INTO systems (id,data) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
      s.id,
      JSON.stringify(s),
    ]);
  await pool.query(
    "INSERT INTO users (id,name,email,password_hash,role,email_verified) VALUES ($1,$2,$3,$4,'admin',TRUE) ON CONFLICT (email) DO NOTHING",
    [
      randomUUID(),
      'Administrador',
      process.env.ADMIN_EMAIL.trim().toLowerCase(),
      await hashPassword(process.env.ADMIN_PASSWORD),
    ],
  );
  console.log('Catálogo e administrador inicial preparados. Dados existentes preservados.');
} finally {
  await pool.end();
}
