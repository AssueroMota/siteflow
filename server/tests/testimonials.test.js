import test from 'node:test';
import assert from 'node:assert/strict';
import { testimonialsSchema } from '../validation.js';
import { publicTestimonials } from '../testimonials.js';
const item = {
  id: 'd9adb990-e3cb-47a0-9985-0816ff409f74',
  name: 'Cliente de teste',
  business: 'Empresa de teste',
  quote: 'Texto usado apenas em teste automatizado para validar o fluxo.',
  authorized: false,
  published: false,
  consentNote: 'Informação interna de teste',
};
test('publicação de depoimentos requer autorização também no servidor', () => {
  assert.equal(testimonialsSchema.safeParse({ testimonials: [item] }).success, true);
  assert.equal(
    testimonialsSchema.safeParse({ testimonials: [{ ...item, published: true }] }).success,
    false,
  );
  assert.equal(
    testimonialsSchema.safeParse({ testimonials: [{ ...item, published: true, authorized: true }] })
      .success,
    true,
  );
});
test('catálogo público não revela rascunhos nem notas internas de autorização', () => {
  const result = publicTestimonials([
    item,
    { ...item, id: 'publicado', published: true, authorized: true },
    { ...item, id: 'nao-autorizado', published: true },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'publicado');
  assert.equal('consentNote' in result[0], false);
});
