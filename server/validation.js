import { z } from 'zod';
import { whatsappNumber } from '../shared/contact.js';
const text = (max) => z.string().trim().min(1).max(max);
export const email = z
  .email()
  .max(200)
  .transform((v) => v.toLowerCase());
const httpsUrl = z
  .string()
  .max(2000)
  .refine((v) => !v || /^https:\/\//i.test(v), 'Use uma URL HTTPS.');
export const registerSchema = z.object({
  name: text(100),
  email,
  password: z.string().min(10).max(128),
});
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export const requestSchema = z.object({
  name: text(100),
  email,
  phone: z.string().max(30).default(''),
  business: text(150),
  type: text(100),
  model: z.string().max(150).default(''),
  description: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
});
export const offerSchema = z.object({
  whatsapp: z
    .string()
    .max(30)
    .refine(
      (value) => !value || Boolean(whatsappNumber(value)),
      'Informe um WhatsApp brasileiro com DDD.',
    )
    .default(''),
  title: text(150),
  price: z.number().positive().max(100000),
  checkoutUrl: httpsUrl,
  productId: z.string().max(100),
  support: text(2000),
  license: text(2000),
  access: text(2000),
});
export const systemSchema = z.object({
  id: text(150).regex(/^[a-zA-Z0-9-]+$/),
  name: text(100),
  category: text(100),
  description: text(1000),
  theme: z.enum([
    'barber',
    'restaurant',
    'store',
    'dashboard',
    'clinic',
    'landing',
    'agenda',
    'agency',
    'workspace',
  ]),
  features: z.array(text(200)).min(1).max(30),
  technologies: z.array(text(100)).max(20).default([]),
  featured: z.boolean(),
  published: z.boolean(),
  demoUrl: httpsUrl.default(''),
  imageUrl: z
    .string()
    .max(2000)
    .refine(
      (v) => !v || /^\/uploads\/[a-f0-9-]+\.(png|jpg|webp)$/.test(v) || /^https:\/\//.test(v),
      'Imagem inválida.',
    )
    .default(''),
  createdAt: z.string().max(50).optional(),
});
export const statusSchema = z
  .object({
    status: z
      .enum([
        'Novo',
        'Em análise',
        'Proposta enviada',
        'Em desenvolvimento',
        'Em revisão',
        'Entregue',
        'Cancelado',
      ])
      .optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((v) => v.status !== undefined || v.notes !== undefined);
export const testimonialsSchema = z.object({
  testimonials: z
    .array(
      z
        .object({
          id: z.uuid(),
          name: text(100),
          business: text(150),
          quote: text(1500).min(20),
          consentNote: z.string().max(500).default(''),
          authorized: z.boolean(),
          published: z.boolean(),
        })
        .refine(
          (item) => !item.published || item.authorized,
          'Depoimentos publicados precisam de autorização.',
        ),
    )
    .max(100),
});
