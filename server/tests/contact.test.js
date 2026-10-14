import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsappNumber, whatsappLink, projectMessage } from '../../shared/contact.js';
import { offerSchema } from '../validation.js';
import { initialOffer } from '../../src/data/catalog.js';

test('WhatsApp normaliza DDD e código do país e rejeita números ou links inválidos', () => {
  assert.equal(whatsappNumber('(81) 98995-7462'), '5581989957462');
  assert.equal(whatsappNumber('+55 81 98995-7462'), '5581989957462');
  for (const invalid of [
    '',
    '123',
    'javascript:81989957462',
    'https://wa.me/5581989957462',
    '558198995746299',
  ]) {
    assert.equal(whatsappLink(invalid, 'Oi'), '');
  }
  assert.equal(offerSchema.safeParse({ ...initialOffer, whatsapp: '123' }).success, false);
  assert.equal(offerSchema.safeParse({ ...initialOffer, whatsapp: '' }).success, true);
  const url = new URL(whatsappLink('81989957462', projectMessage('Modelo & Cia', 'ABC123')));
  assert.equal(url.pathname, '/5581989957462');
  assert.match(url.searchParams.get('text'), /Modelo & Cia/);
  assert.match(url.searchParams.get('text'), /ABC123/);
});
