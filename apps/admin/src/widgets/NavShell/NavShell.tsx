import { Card, Logo } from '@mfranceschit/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

type NavGroup = {
  label: string;
  links: { to: string; label: string }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Certifications',
    links: [
      { to: '/degrees', label: 'Degrees' },
      { to: '/certifications', label: 'Certificates' },
    ],
  },
  {
    label: 'Work',
    links: [{ to: '/projects', label: 'Projects' }],
  },
  {
    label: 'Billing',
    links: [
      { to: '/clients', label: 'Clients' },
      { to: '/invoices', label: 'Invoices' },
      { to: '/settings/business-profile', label: 'Business Profile' },
    ],
  },
];

export function NavShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-[var(--border-subtle)] p-4">
        <Logo variant="navy" height={32} />
        <nav className="mt-6 flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-sm px-2 py-1.5 font-sans text-sm text-[var(--text-body)] hover:bg-[var(--primary-soft)]"
                    activeProps={{ className: 'bg-[var(--primary-soft)] font-medium' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Card padding="0">{children}</Card>
      </main>
    </div>
  );
}
