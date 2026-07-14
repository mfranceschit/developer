import { buildDashboard, type DashboardData } from '@/shared/lib/dashboard';
import { listInvoices } from './invoices';
import { listDocuments } from './queries';

export async function getDashboard(): Promise<DashboardData> {
  const [projects, certifications, degrees, clients, invoices] = await Promise.all([
    listDocuments<{ _id: string; name: string }>('project'),
    listDocuments<{ _id: string; name: string }>('certification'),
    listDocuments<{ _id: string; name: { en: string } }>('degree'),
    listDocuments<{ _id: string; name: string }>('client'),
    listInvoices(),
  ]);
  return buildDashboard({ projects, certifications, degrees, clients, invoices });
}
