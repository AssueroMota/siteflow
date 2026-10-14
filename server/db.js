import pg from 'pg';
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});
export async function setting(key, fallback = null, client = pool) {
  const { rows } = await client.query('SELECT value FROM settings WHERE key=$1', [key]);
  return rows[0]?.value ?? fallback;
}
