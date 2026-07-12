import { describe, expect, it } from 'vitest';
import {
  certificationSchema,
  clientSchema,
  degreeSchema,
  invoiceSchema,
  localeContentSchema,
  localeStringSchema,
  projectSchema,
  sanityImageSchema,
} from './schemas';

describe('localeStringSchema', () => {
  it('accepts en/es/pt string map', () => {
    const result = localeStringSchema.parse({ en: 'Hello', es: 'Hola', pt: 'Olá' });
    expect(result).toEqual({ en: 'Hello', es: 'Hola', pt: 'Olá' });
  });

  it('rejects a missing default locale', () => {
    expect(() => localeStringSchema.parse({ es: 'Hola', pt: 'Olá' })).toThrow();
  });
});

describe('localeContentSchema', () => {
  it('accepts en/es/pt block arrays', () => {
    const block = [{ _type: 'block', children: [{ text: 'hi' }] }];
    const result = localeContentSchema.parse({ en: block, es: [], pt: [] });
    expect(result.en).toEqual(block);
  });
});

describe('sanityImageSchema', () => {
  it('accepts an image with hotspot, crop, and alt', () => {
    const image = {
      _type: 'image',
      asset: { _ref: 'image-abc-100x100-png', _type: 'reference' },
      hotspot: { x: 0.5, y: 0.5, height: 1, width: 1 },
      crop: { top: 0, bottom: 0, left: 0, right: 0 },
      alt: 'A photo',
    };
    expect(sanityImageSchema.parse(image)).toEqual(image);
  });

  it('accepts an image without hotspot/crop', () => {
    const image = {
      _type: 'image',
      asset: { _ref: 'image-abc-100x100-png', _type: 'reference' },
      alt: 'A photo',
    };
    expect(sanityImageSchema.parse(image)).toEqual(image);
  });
});

describe('projectSchema', () => {
  it('accepts a full project document', () => {
    const project = {
      _id: 'proj-1',
      _type: 'project',
      name: 'Portfolio',
      slug: 'portfolio',
      image: {
        _type: 'image',
        asset: { _ref: 'image-abc-100x100-png', _type: 'reference' },
        alt: 'Screenshot',
      },
      url: 'https://example.com',
      repository: 'https://github.com/example/example',
      description: { en: [], es: [], pt: [] },
      technologies: ['TypeScript', 'React'],
    };
    expect(projectSchema.parse(project)).toEqual(project);
  });
});

describe('certificationSchema', () => {
  it('accepts a certification document', () => {
    const cert = {
      _id: 'cert-1',
      _type: 'certification',
      name: 'AWS SA',
      date: '2024-01-01',
      image: {
        _type: 'image',
        asset: { _ref: 'image-abc-100x100-png', _type: 'reference' },
        alt: 'Badge',
      },
      url: 'https://example.com/cert',
      issued: { en: 'Issued', es: 'Emitido', pt: 'Emitido' },
    };
    expect(certificationSchema.parse(cert)).toEqual(cert);
  });
});

describe('degreeSchema', () => {
  it('accepts a degree document', () => {
    const degree = {
      _id: 'deg-1',
      _type: 'degree',
      name: { en: 'BSc', es: 'Lic.', pt: 'Bacharel' },
      image: {
        _type: 'image',
        asset: { _ref: 'image-abc-100x100-png', _type: 'reference' },
        alt: 'Seal',
      },
      issued: { en: '2020', es: '2020', pt: '2020' },
    };
    expect(degreeSchema.parse(degree)).toEqual(degree);
  });
});

describe('clientSchema', () => {
  it('accepts a client with optional taxId/defaultRate', () => {
    const client = {
      _id: 'client-1',
      _type: 'client',
      name: 'Acme Inc',
      email: 'billing@acme.test',
      phone: '+1 555 0100',
      address: '123 Main St',
      currency: 'USD',
    };
    expect(clientSchema.parse(client)).toEqual(client);
  });
});

describe('invoiceSchema', () => {
  it('accepts a draft invoice', () => {
    const invoice = {
      _id: 'invoice-1',
      _type: 'invoice',
      seq: 7,
      issuerSnapshot: {
        name: 'Marco Franceschi',
        taxId: '123',
        address: 'Street 1',
        phone: '555',
        email: 'me@mfranceschit.com',
      },
      client: { _ref: 'client-1', _type: 'reference' },
      clientSnapshot: {
        name: 'Acme Inc',
        email: 'billing@acme.test',
        phone: '+1 555 0100',
        address: '123 Main St',
        currency: 'USD',
      },
      issueDate: '2026-07-12',
      currency: 'USD',
      lineItems: [{ quantity: 2, description: 'Consulting', unitPrice: 100 }],
      taxRate: 21,
      status: 'draft' as const,
      totals: { subtotal: 200, vat: 42, total: 242 },
    };
    expect(invoiceSchema.parse(invoice)).toEqual(invoice);
  });

  it('rejects an invalid status', () => {
    const invoice = {
      _id: 'invoice-1',
      _type: 'invoice',
      seq: 7,
      issuerSnapshot: {
        name: 'Marco Franceschi',
        taxId: '123',
        address: 'Street 1',
        phone: '555',
        email: 'me@mfranceschit.com',
      },
      client: { _ref: 'client-1', _type: 'reference' },
      clientSnapshot: {
        name: 'Acme Inc',
        email: 'billing@acme.test',
        phone: '+1 555 0100',
        address: '123 Main St',
        currency: 'USD',
      },
      issueDate: '2026-07-12',
      currency: 'USD',
      lineItems: [],
      taxRate: 21,
      status: 'archived',
      totals: { subtotal: 0, vat: 0, total: 0 },
    };
    expect(() => invoiceSchema.parse(invoice)).toThrow();
  });
});
