import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, checkPassword, secretMatches, digest, makeToken } from '../security.js';
import { requestSchema, systemSchema, offerSchema } from '../validation.js';
import { initialOffer, initialSystems } from '../../src/data/catalog.js';
test('senhas têm salt distinto e são verificadas sem armazenar texto', async () => {
  const a = await hashPassword('senha-de-teste-2026');
  const b = await hashPassword('senha-de-teste-2026');
  assert.notEqual(a, b);
  assert.equal(await checkPassword('senha-de-teste-2026', a), true);
  assert.equal(await checkPassword('outra-senha', a), false);
  assert.equal(await checkPassword('x', null), false);
});
test('tokens secretos e sessões são comparados e armazenados por hash', () => {
  assert.equal(secretMatches('secret', 'secret'), true);
  assert.equal(secretMatches('x', 'secret'), false);
  assert.equal(secretMatches('', undefined), false);
  const token = makeToken();
  assert.equal(token.length, 64);
  assert.notEqual(digest(token), token);
});
test('briefing exige consentimento, escopo mínimo e normaliza e-mail', () => {
  const input = {
    name: 'Cliente',
    email: 'CLIENTE@example.com',
    business: 'Empresa',
    type: 'Site',
    description: 'Preciso de um site para apresentar minha empresa.',
    consent: true,
  };
  const parsed = requestSchema.parse(input);
  assert.equal(parsed.email, 'cliente@example.com');
  assert.equal(requestSchema.safeParse({ ...input, consent: false }).success, false);
  assert.equal(requestSchema.safeParse({ ...input, description: 'oi' }).success, false);
});
test('catálogo e oferta aceitam referências e rejeitam links executáveis', () => {
  assert.equal(systemSchema.safeParse(initialSystems[0]).success, true);
  assert.equal(offerSchema.safeParse(initialOffer).success, true);
  assert.equal(
    systemSchema.safeParse({ ...initialSystems[0], demoUrl: 'javascript:alert(1)' }).success,
    false,
  );
  assert.equal(offerSchema.safeParse({ ...initialOffer, price: -1 }).success, false);
});
