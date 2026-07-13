import { formatInvoiceNumber } from '@/shared/lib/format';
import type { DocumentStatus, Invoice } from '@/shared/types';

export type AttentionType = 'project' | 'certification' | 'degree' | 'client';

export type AttentionItem = {
  id: string;
  type: AttentionType;
  typeLabel: string;
  name: string;
  status: DocumentStatus;
};

export type OutstandingTotal = { amount: number; currency: string | 'mixed' };

export type RecentInvoice = {
  id: string;
  number: string;
  clientName: string;
  total: number;
  currency: string;
  status: Invoice['status'];
  issueDate: string;
  dueDate?: string;
};

export type DashboardData = {
  attention: AttentionItem[];
  counts: {
    projects: number;
    certifications: number;
    degrees: number;
    clients: number;
    invoices: number;
  };
  outstandingTotal: OutstandingTotal;
  recentInvoices: RecentInvoice[];
};

type Statused<T> = T & { _id: string; _status: DocumentStatus };

export type DashboardInput = {
  projects: Array<Statused<{ name: string }>>;
  certifications: Array<Statused<{ name: string }>>;
  degrees: Array<Statused<{ name: { en: string } }>>;
  clients: Array<Statused<{ name: string }>>;
  invoices: Invoice[];
};

const TYPE_LABEL: Record<AttentionType, string> = {
  project: 'Project',
  certification: 'Certificate',
  degree: 'Degree',
  client: 'Client',
};

const RECENT_LIMIT = 3;

function collect<T extends { _id: string; _status: DocumentStatus }>(
  type: AttentionType,
  docs: T[],
  getName: (doc: T) => string,
): AttentionItem[] {
  return docs
    .filter((doc) => doc._status !== 'published')
    .map((doc) => ({
      id: doc._id,
      type,
      typeLabel: TYPE_LABEL[type],
      name: getName(doc),
      status: doc._status,
    }));
}

export function buildDashboard(input: DashboardInput): DashboardData {
  const attention: AttentionItem[] = [
    ...collect('project', input.projects, (d) => d.name),
    ...collect('certification', input.certifications, (d) => d.name),
    ...collect('degree', input.degrees, (d) => d.name.en),
    ...collect('client', input.clients, (d) => d.name),
  ];

  const sent = input.invoices.filter((i) => i.status === 'sent');
  const currencies = new Set(sent.map((i) => i.currency));
  const outstandingTotal: OutstandingTotal = {
    amount: sent.reduce((sum, i) => sum + i.totals.total, 0),
    currency: currencies.size > 1 ? 'mixed' : ([...currencies][0] ?? 'USD'),
  };

  const recentInvoices = [...input.invoices]
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .slice(0, RECENT_LIMIT)
    .map((i) => ({
      id: i._id,
      number: formatInvoiceNumber(i),
      clientName: i.clientSnapshot.name,
      total: i.totals.total,
      currency: i.currency,
      status: i.status,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
    }));

  return {
    attention,
    counts: {
      projects: input.projects.length,
      certifications: input.certifications.length,
      degrees: input.degrees.length,
      clients: input.clients.length,
      invoices: input.invoices.length,
    },
    outstandingTotal,
    recentInvoices,
  };
}
