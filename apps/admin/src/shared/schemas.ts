import { z } from 'zod';

export const localeStringSchema = z.object({
  en: z.string(),
  es: z.string().default(''),
  pt: z.string().default(''),
});

export const localeContentSchema = z.object({
  en: z.array(z.record(z.string(), z.unknown())),
  es: z.array(z.record(z.string(), z.unknown())).default([]),
  pt: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const sanityImageSchema = z.object({
  _type: z.literal('image'),
  asset: z.object({
    _ref: z.string(),
    _type: z.literal('reference'),
  }),
  hotspot: z
    .object({
      x: z.number(),
      y: z.number(),
      height: z.number(),
      width: z.number(),
    })
    .optional(),
  crop: z
    .object({
      top: z.number(),
      bottom: z.number(),
      left: z.number(),
      right: z.number(),
    })
    .optional(),
  alt: z.string(),
});

export const projectSchema = z.object({
  _id: z.string(),
  _type: z.literal('project'),
  name: z.string(),
  slug: z.string(),
  image: sanityImageSchema,
  url: z.string().url(),
  repository: z.string().url(),
  description: localeContentSchema,
  technologies: z.array(z.string()),
});

export const certificationSchema = z.object({
  _id: z.string(),
  _type: z.literal('certification'),
  name: z.string(),
  date: z.string(),
  image: sanityImageSchema,
  url: z.string().url(),
  issued: localeStringSchema,
});

export const degreeSchema = z.object({
  _id: z.string(),
  _type: z.literal('degree'),
  name: localeStringSchema,
  image: sanityImageSchema,
  issued: localeStringSchema,
});

export const aboutSchema = z.object({
  _id: z.union([z.literal('about'), z.literal('drafts.about')]),
  _type: z.literal('about'),
  eyebrow: localeStringSchema,
  title: localeStringSchema,
  body: localeContentSchema,
  stack: z.array(z.string()),
});

export const businessProfileSchema = z.object({
  _id: z.literal('businessProfile'),
  _type: z.literal('businessProfile'),
  name: z.string(),
  taxId: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

export const clientSchema = z.object({
  _id: z.string(),
  _type: z.literal('client'),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  taxId: z.string().optional(),
  currency: z.string().default('USD'),
  defaultRate: z.number().optional(),
});

export const lineItemSchema = z.object({
  quantity: z.number(),
  description: z.string(),
  unitPrice: z.number(),
});

const partySnapshotSchema = z.object({
  name: z.string(),
  taxId: z.string().optional(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

const clientSnapshotSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  currency: z.string(),
});

export const invoiceStatusSchema = z.enum(['draft', 'sent', 'paid']);

export const invoiceTotalsSchema = z.object({
  subtotal: z.number(),
  vat: z.number(),
  total: z.number(),
});

export const invoiceSchema = z.object({
  _id: z.string(),
  _type: z.literal('invoice'),
  seq: z.number().int().positive(),
  issuerSnapshot: partySnapshotSchema,
  client: z.object({ _ref: z.string(), _type: z.literal('reference') }),
  clientSnapshot: clientSnapshotSchema,
  issueDate: z.string(),
  dueDate: z.string().optional(),
  currency: z.string().default('USD'),
  lineItems: z.array(lineItemSchema),
  taxRate: z.number(),
  notes: z.string().optional(),
  status: invoiceStatusSchema,
  totals: invoiceTotalsSchema,
});
