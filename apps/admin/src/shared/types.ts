import type { z } from 'zod';
import type {
  businessProfileSchema,
  certificationSchema,
  clientSchema,
  degreeSchema,
  invoiceSchema,
  invoiceStatusSchema,
  invoiceTotalsSchema,
  lineItemSchema,
  localeContentSchema,
  localeStringSchema,
  projectSchema,
  sanityImageSchema,
} from './schemas';

export type LocaleString = z.infer<typeof localeStringSchema>;
export type LocaleContent = z.infer<typeof localeContentSchema>;
export type SanityImage = z.infer<typeof sanityImageSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Degree = z.infer<typeof degreeSchema>;
export type BusinessProfile = z.infer<typeof businessProfileSchema>;
export type Client = z.infer<typeof clientSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type InvoiceTotals = z.infer<typeof invoiceTotalsSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

export type DocumentStatus = 'published' | 'draft' | 'unpublished-changes';
