import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newDb } from 'pg-mem';
import { normalizeWebhook, processWebhook, nextMonth } from '../hotmart.js';
const config = { hottok: 'token-teste', productId: '42' };
const date = Date.UTC(2026, 0, 31, 12);
function body(event = 'PURCHASE_APPROVED', id = 'event-1', time = date) {
  return {
    id,
    event,
    version: '2.0.0',
    creation_date: time,
    data: {
      product: { id: 42 },
      buyer: { email: 'CLIENTE@example.com' },
      purchase: { transaction: 'HP-1', approved_date: date },
      subscription: { subscriber: { code: 'sub-1' } },
    },
  };
}
async function database() {
  const db = newDb();
  db.public.none(await readFile(new URL('../schema.sql', import.meta.url), 'utf8'));
  const pg = db.adapters.createPg();
  return new pg.Pool();
}
test('webhook recusa token ausente, produto divergente e payload inválido', () => {
  assert.throws(() => normalizeWebhook(body(), '', config), { status: 401 });
  assert.throws(() => normalizeWebhook(body(), 'token-teste', { ...config, productId: '99' }), {
    status: 400,
  });
  assert.throws(() => normalizeWebhook({}, 'token-teste', config), { status: 400 });
});
test('vigência mensal respeita meses mais curtos e data da próxima cobrança', () => {
  assert.equal(nextMonth(date).toISOString(), '2026-02-28T12:00:00.000Z');
  const input = body();
  input.data.purchase.date_next_charge = Date.UTC(2026, 2, 1);
  assert.equal(
    normalizeWebhook(input, 'token-teste', config).validUntil.toISOString(),
    '2026-03-01T00:00:00.000Z',
  );
});
test('status financeiro só é criado para eventos aprovados ou revogados', () => {
  assert.equal(
    normalizeWebhook(body('PURCHASE_BILLET_PRINTED'), 'token-teste', config).ignored,
    true,
  );
  assert.equal(
    normalizeWebhook(body('PURCHASE_REFUNDED'), 'token-teste', config).status,
    'revoked',
  );
});
test('reenvio de evento não duplica a transação', async () => {
  const pool = await database();
  try {
    const event = normalizeWebhook(body(), 'token-teste', config);
    assert.equal((await processWebhook(pool, event)).processed, true);
    assert.equal((await processWebhook(pool, event)).duplicate, true);
    assert.equal((await pool.query('SELECT * FROM orders')).rows.length, 1);
  } finally {
    await pool.end();
  }
});
test('reembolso revoga acesso e aprovação atrasada não restaura pagamento', async () => {
  const pool = await database();
  try {
    await processWebhook(pool, normalizeWebhook(body(), 'token-teste', config));
    await processWebhook(
      pool,
      normalizeWebhook(body('PURCHASE_REFUNDED', 'refund', date + 2000), 'token-teste', config),
    );
    await processWebhook(
      pool,
      normalizeWebhook(body('PURCHASE_APPROVED', 'late', date + 1000), 'token-teste', config),
    );
    assert.equal((await pool.query('SELECT status FROM orders')).rows[0].status, 'revoked');
    await processWebhook(
      pool,
      normalizeWebhook(body('PURCHASE_COMPLETE', 'later', date + 3000), 'token-teste', config),
    );
    assert.equal((await pool.query('SELECT status FROM orders')).rows[0].status, 'revoked');
  } finally {
    await pool.end();
  }
});
test('cancelamento da assinatura mantém período pago e impede renovação', async () => {
  const pool = await database();
  try {
    await processWebhook(pool, normalizeWebhook(body(), 'token-teste', config));
    const cancel = {
      id: 'cancel',
      event: 'SUBSCRIPTION_CANCELLATION',
      version: '2.0.0',
      creation_date: date + 1000,
      data: { product: { id: 42 }, subscriber: { code: 'sub-1', email: 'cliente@example.com' } },
    };
    await processWebhook(pool, normalizeWebhook(cancel, 'token-teste', config));
    const row = (await pool.query('SELECT status,auto_renew,valid_until FROM orders')).rows[0];
    assert.equal(row.status, 'active');
    assert.equal(row.auto_renew, false);
    assert.equal(new Date(row.valid_until).toISOString(), '2026-02-28T12:00:00.000Z');
  } finally {
    await pool.end();
  }
});
test('cancelamento recebido antes da aprovação continua aplicado', async () => {
  const pool = await database();
  try {
    const cancel = {
      id: 'cancel',
      event: 'SUBSCRIPTION_CANCELLATION',
      version: '2.0.0',
      creation_date: date + 1000,
      data: { product: { id: 42 }, subscriber: { code: 'sub-1', email: 'cliente@example.com' } },
    };
    await processWebhook(pool, normalizeWebhook(cancel, 'token-teste', config));
    await processWebhook(pool, normalizeWebhook(body(), 'token-teste', config));
    assert.equal((await pool.query('SELECT auto_renew FROM orders')).rows[0].auto_renew, false);
  } finally {
    await pool.end();
  }
});
