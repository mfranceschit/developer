import { Dialog, Portal } from '@ark-ui/react';

export type MobileNavLink = {
  href: string;
  label: string;
  active?: boolean;
};

export type MobileNavProps = {
  links: MobileNavLink[];
  languages?: MobileNavLink[];
  triggerLabel?: string;
  closeLabel?: string;
  className?: string;
};

const triggerClasses =
  'inline-flex h-10 w-10 items-center justify-center rounded-md ' +
  'bg-transparent text-[var(--text-heading-strong)] ' +
  'transition-colors duration-200 hover:bg-[var(--primary-soft)] ' +
  'focus-visible:shadow-focus outline-hidden cursor-pointer';

const contentClasses =
  'fixed inset-0 z-50 flex flex-col ' +
  'bg-[var(--surface-header-glass)] backdrop-blur-[20px] ' +
  'data-[state=open]:animate-[mf-fade-in_220ms_ease-out]';

const linkClasses = (active?: boolean) =>
  [
    'border-l-2 py-3 pl-5 text-2xl no-underline transition-colors duration-200',
    active
      ? 'border-very-berry font-semibold text-white'
      : 'border-transparent font-normal text-[var(--text-nav)] hover:text-white',
  ].join(' ');

const languageClasses = (active?: boolean) =>
  [
    'py-2 text-sm no-underline transition-colors duration-200',
    active
      ? 'font-semibold text-white'
      : 'font-normal text-[var(--text-muted)] hover:text-white',
  ].join(' ');

export function MobileNav({
  links,
  languages = [],
  triggerLabel = 'Open menu',
  closeLabel = 'Close menu',
  className = '',
}: MobileNavProps) {
  return (
    <Dialog.Root lazyMount unmountOnExit>
      <Dialog.Trigger
        aria-label={triggerLabel}
        className={[triggerClasses, className].filter(Boolean).join(' ')}
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 6h16M3 11h16M3 16h16" />
        </svg>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-[var(--surface-header-glass)]" />
        <Dialog.Positioner className="fixed inset-0 z-50">
          <Dialog.Content className={contentClasses}>
            <div className="flex h-16 items-center justify-between px-7">
              <Dialog.Title className="mf-wordmark text-[15px] font-semibold text-white">
                mfranceschit
              </Dialog.Title>
              <Dialog.CloseTrigger aria-label={closeLabel} className={triggerClasses}>
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
              </Dialog.CloseTrigger>
            </div>
            <nav
              aria-label="Main"
              className="flex flex-1 flex-col justify-center gap-1 px-7"
            >
              {links.map(({ href, label, active }) => (
                <a key={href} href={href} className={linkClasses(active)}>
                  {label}
                </a>
              ))}
            </nav>
            {languages.length > 0 && (
              <div className="flex items-center gap-6 border-t border-[var(--border-hairline)] px-7 py-5">
                {languages.map(({ href, label, active }) => (
                  <a
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={languageClasses(active)}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
