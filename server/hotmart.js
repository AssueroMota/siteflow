import { secretMatches } from './security.js';
const approved = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
const revoked = new Set([
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_CANCELED',
  'PURCHASE_EXPIRED',
]);
export function nextMonth(timestamp) {
  const date = new Date(timestamp);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date;
}
export function normalizeWebhook(body, token, config) {
  if (!secretMatches(token, config.hottok))
    throw Object.assign(new Error('Notificação não autorizada.'), { status: 401 });
  if (
    body?.version !== '2.0.0' ||
    typeof body.id !== 'string' ||
    body.id.length > 200 ||
    !Number.isSafeInteger(body.creation_date) ||
    body.creation_date <= 0 ||
    typeof body.event !== 'string'
  )
    throw Object.assign(new Error('Evento inválido.'), { status: 400 });
  if (!config.productId || String(body.data?.product?.id) !== String(config.productId))
    throw Object.assign(new Error('Produto não reconhecido.'), { status: 400 });
  if (body.event === 'SUBSCRIPTION_CANCELLATION') {
    const subscriber = body.data?.subscriber;
    if (
      typeof subscriber?.code !== 'string' ||
      !subscriber.code ||
      subscriber.code.length > 200 ||
      typeof subscriber.email !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(subscriber.email)
    )
      throw Object.assign(new Error('Assinatura inválida.'), { status: 400 });
    return {
      id: body.id,
      event: body.event,
      subscriptionCode: subscriber.code,
      email: subscriber.email.toLowerCase(),
      productId: String(config.productId),
      eventDate: body.creation_date,
      cancel: true,
    };
  }
  if (!approved.has(body.event) && !revoked.has(body.event))
    return { id: body.id, event: body.event, ignored: true };
  const purchase = body.data?.purchase;
  const email = body.data?.buyer?.email?.trim().toLowerCase();
  if (
    !email ||
    email.length > 200 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof purchase?.transaction !== 'string' ||
    !purchase.transaction ||
    purchase.transaction.length > 200
  )
    throw Object.assign(new Error('Dados de compra inválidos.'), { status: 400 });
  const renewal = Number(purchase.date_next_charge);
  const approvedAt = Number(purchase.approved_date) || body.creation_date;
  const validUntil =
    Number.isFinite(renewal) && renewal > approvedAt && renewal < approvedAt + 370 * 86400000
      ? new Date(renewal)
      : nextMonth(approvedAt);
  return {
    id: body.id,
    event: body.event,
    transaction: purchase.transaction,
    email,
    productId: String(config.productId),
    subscriptionCode:
      body.data?.subscription?.subscriber?.code || body.data?.subscription?.code || null,
    status: approved.has(body.event) ? 'active' : 'revoked',
    validUntil,
    eventDate: body.creation_date,
  };
}
export async function processWebhook(pool, event) {
  if (event.ignored) return { ignored: true };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const seen = await client.query(
      'INSERT INTO webhook_events (id,event) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING id',
      [event.id, event.event],
    );
    if (!seen.rowCount) {
      await client.query('COMMIT');
      return { duplicate: true };
    }
    if (event.cancel) {
      await client.query(
        'INSERT INTO subscription_cancellations(code,product_id,email,event_date) VALUES($1,$2,$3,$4) ON CONFLICT(code) DO UPDATE SET event_date=EXCLUDED.event_date WHERE subscription_cancellations.event_date < EXCLUDED.event_date',
        [event.subscriptionCode, event.productId, event.email, event.eventDate],
      );
      await client.query(
        'UPDATE orders SET auto_renew=FALSE WHERE subscription_code=$1 AND product_id=$2 AND event_date<=$3',
        [event.subscriptionCode, event.productId, event.eventDate],
      );
      await client.query('COMMIT');
      return { processed: true };
    }
    await client.query(
      `INSERT INTO orders (transaction,email,product_id,subscription_code,status,valid_until,event_date)
 VALUES ($1,$2,$3,$4,$5,$6,$7)
 ON CONFLICT (transaction) DO UPDATE SET status=EXCLUDED.status,valid_until=EXCLUDED.valid_until,event_date=EXCLUDED.event_date
 WHERE orders.event_date <= EXCLUDED.event_date AND (orders.status <> 'revoked' OR EXCLUDED.status = 'revoked')`,
      [
        event.transaction,
        event.email,
        event.productId,
        event.subscriptionCode,
        event.status,
        event.validUntil,
        event.eventDate,
      ],
    );
    if (event.subscriptionCode) {
      const cancellation = await client.query(
        'SELECT event_date FROM subscription_cancellations WHERE code=$1 AND product_id=$2',
        [event.subscriptionCode, event.productId],
      );
      if (cancellation.rows[0] && Number(cancellation.rows[0].event_date) >= event.eventDate)
        await client.query('UPDATE orders SET auto_renew=FALSE WHERE transaction=$1', [
          event.transaction,
        ]);
    }
    await client.query('COMMIT');
    return { processed: true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
