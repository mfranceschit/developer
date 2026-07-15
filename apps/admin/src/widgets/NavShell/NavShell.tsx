import { Logo } from '@mfranceschit/ui';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useState } from 'react';
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

const mobileLinkBase =
  'flex min-h-11 items-center justify-between rounded-lg border border-transparent p-3 ' +
  'font-sans text-[15px] text-[var(--mf-gray-600)] transition-colors';
const mobileLinkActive =
  'border-[var(--border-subtle)] bg-[var(--surface-card)] font-semibold ' +
  'text-[var(--text-strong)] shadow-xs';

const iconButtonClasses =
  'inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-default)] ' +
  'text-bellwether-blue transition-colors hover:bg-gray-50';

function NavLinks({
  counts,
  linkClassName,
  activeClassName,
  countClassName,
  onLinkClick,
}: {
  counts?: Partial<Record<CountKey, number>>;
  linkClassName: string;
  activeClassName: string;
  countClassName: string;
  onLinkClick?: () => void;
}) {
  return (
    <>
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
                className={linkClassName}
                activeProps={{ className: activeClassName }}
                onClick={onLinkClick}
              >
                <span>{link.label}</span>
                {link.countKey && counts && (
                  <span className={countClassName}>{counts[link.countKey]}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function FooterLink() {
  return (
    <a href="https://mfranceschit.com" className="font-sans text-[13px] text-[var(--mf-gray-500)]">
      mfranceschit.com ↗
    </a>
  );
}

export function NavShell({ children }: { children: ReactNode }) {
  const { data } = useDashboard();
  const counts = data?.counts;
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col overflow-y-auto border-r border-[var(--mf-sand-200)] bg-[var(--mf-sand-50)] px-5 pb-5 pt-7 md:flex print:hidden">
        <div className="px-2">
          <Logo variant="navy" height={34} />
        </div>
        <nav className="mt-8 flex flex-col gap-6">
          <NavLinks
            counts={counts}
            linkClassName={linkBase}
            activeClassName={linkActive}
            countClassName="font-sans text-xs text-[var(--mf-gray-400)]"
          />
        </nav>
        <div className="mt-auto border-t border-[var(--mf-sand-200)] px-2 pt-5">
          <FooterLink />
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-[var(--surface-page)]">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--border-subtle)] bg-white/[0.82] px-4 py-2.5 backdrop-blur-[10px] md:hidden print:hidden">
          <Logo variant="navy" height={26} />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
            className={iconButtonClasses}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 6h16M3 11h16M3 16h16" />
            </svg>
          </button>
        </div>

        {navOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[var(--mf-sand-50)] p-5 pb-6 md:hidden">
            <div className="flex items-center justify-between gap-2">
              <Logo variant="navy" height={28} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setNavOpen(false)}
                className={iconButtonClasses}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            <nav className="mt-7 flex flex-col gap-7">
              <NavLinks
                counts={counts}
                linkClassName={mobileLinkBase}
                activeClassName={mobileLinkActive}
                countClassName="font-sans text-[13px] text-[var(--mf-gray-400)]"
                onLinkClick={() => setNavOpen(false)}
              />
            </nav>
            <div className="pt-6">
              <FooterLink />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1100px] px-4 pb-12 pt-5 md:px-12 md:pb-16 md:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
