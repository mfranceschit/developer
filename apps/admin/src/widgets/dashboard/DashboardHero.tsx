import { Button } from '@mfranceschit/ui';

export type DashboardHeroProps = {
  summary: string;
  onNewProject: () => void;
  onNewInvoice: () => void;
  onEditAbout: () => void;
};

export function DashboardHero({
  summary,
  onNewProject,
  onNewInvoice,
  onEditAbout,
}: DashboardHeroProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl px-10 py-9 text-white"
      style={{
        background: 'linear-gradient(135deg, var(--mf-blue-700) 0%, var(--mf-blue-900) 100%)',
      }}
    >
      <img
        src="/assets/logos/monogram-beige.svg"
        alt=""
        className="pointer-events-none absolute right-[-30px] top-1/2 h-[220px] -translate-y-1/2 opacity-[0.14]"
      />
      <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mf-sand)]">
        mfranceschit · studio
      </div>
      <h1 className="mb-1.5 mt-2.5 font-sans text-[30px] font-bold tracking-[-0.015em] text-white">
        Welcome back, Marco
      </h1>
      <p className="m-0 max-w-[520px] font-sans text-[15px] text-white/80">{summary}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="accent" size="sm" onClick={onNewProject}>
          New project
        </Button>
        <Button variant="glass" size="sm" onClick={onNewInvoice}>
          New invoice
        </Button>
        <Button variant="glass" size="sm" onClick={onEditAbout}>
          Edit about
        </Button>
      </div>
    </div>
  );
}
