import { Logo } from '@mfranceschit/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useDashboard } from '@/features/dashboard/queries';

type CountKey = 'projects' | 'certifications' | 'degrees' | 'clients' | 'invoices';

type NavLink = { to: string; label: string; countKey?: CountKey };
type NavGroup = { label: string; links: NavLink[] };

const NAV_GROUPS: NavGroup[] = [
  { label: 'Studio', links: [{ to: '/', label: 'Dashboard' }] },
  {
    label: 'Certifications',
    links: [
      { to: '/degrees', label: 'Degrees', countKey: 'degrees' },
      { to: '/certifications', label: 'Certificates', countKey: 'certifications' },
    ],
  },
  { label: 'Work', links: [{ to: '/projects', label: 'Projects', countKey: 'projects' }] },
  { label: 'Site', links: [{ to: '/about', label: 'About' }] },
  {
    label: 'Billing',
    links: [
      { to: '/clients', label: 'Clients', countKey: 'clients' },
      { to: '/invoices', label: 'Invoices', countKey: 'invoices' },
      { to: '/settings/business-profile', label: 'Business Profile' },
    ],
  },
];

const linkBase =
  'flex items-center justify-between rounded-lg border border-transparent px-2.5 py-2 ' +
  'font-sans text-sm text-[var(--mf-gray-600)] transition-colors hover:bg-white/75';
const linkActive =
  'border-[var(--border-subtle)] bg-[var(--surface-card)] font-semibold ' +
  'text-[var(--text-strong)] shadow-xs';

export function NavShell({ children }: { children: ReactNode }) {
  const { data } = useDashboard();
  const counts = data?.counts;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[264px] shrink-0 flex-col overflow-y-auto border-r border-[var(--mf-sand-200)] bg-[var(--mf-sand-50)] px-5 pb-5 pt-7 print:hidden">
        <div className="px-2">
          <Logo variant="navy" height={34} />
        </div>
        <nav className="mt-8 flex flex-col gap-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-1.5 px-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mf-gray-500)]">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    activeOptions={{ exact: link.to === '/' }}
                    className={linkBase}
                    activeProps={{ className: linkActive }}
                  >
                    <span>{link.label}</span>
                    {link.countKey && counts && (
                      <span className="font-sans text-xs text-[var(--mf-gray-400)]">
                        {counts[link.countKey]}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto border-t border-[var(--mf-sand-200)] px-2 pt-5">
          <a
            href="https://mfranceschit.com"
            className="font-sans text-[13px] text-[var(--mf-gray-500)]"
          >
            mfranceschit.com ↗
          </a>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-[var(--surface-page)]">
        <div className="mx-auto max-w-[1100px] px-12 pb-16 pt-10">{children}</div>
      </main>
    </div>
  );
}
