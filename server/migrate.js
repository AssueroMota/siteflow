import { readFile } from 'node:fs/promises';
import { pool } from './db.js';
try {
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL em server/.env.');
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log('Migração concluída.');
} finally {
  await pool.end();
}
