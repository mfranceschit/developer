import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const spacing = [
  { step: 1, px: 4 },
  { step: 2, px: 8 },
  { step: 3, px: 12 },
  { step: 4, px: 16 },
  { step: 6, px: 24 },
  { step: 8, px: 32 },
  { step: 12, px: 48 },
  { step: 16, px: 64 },
  { step: 20, px: 80 },
];

const radii = [
  { token: '--radius-sm', name: 'sm', px: 4 },
  { token: '--radius-md', name: 'md', px: 8 },
  { token: '--radius-lg', name: 'lg', px: 12 },
  { token: '--radius-xl', name: 'xl', px: 16 },
  { token: '--radius-2xl', name: '2xl', px: 24 },
  { token: '--radius-pill', name: 'pill', px: 999 },
];

const shadows = [
  { token: '--shadow-xs', name: 'shadow-xs' },
  { token: '--shadow-sm', name: 'shadow-sm' },
  { token: '--shadow-md', name: 'shadow-md' },
  { token: '--shadow-lg', name: 'shadow-lg' },
];

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">{title}</h2>
    {hint && <p className="mb-4 text-sm text-[var(--text-muted)]">{hint}</p>}
    {children}
  </section>
);

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-[var(--surface-page)] p-8 font-sans text-[var(--text-strong)]">
      <div className="mx-auto max-w-5xl">
        <Section title="Spacing Scale" hint="4px base grid.">
          <div className="flex items-end gap-3.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
            {spacing.map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-1.5">
                <div className="w-[22px] rounded-sm bg-[var(--mf-blue-600)]" style={{ height: s.px }} />
                <div className="text-[10px] tabular-nums text-[var(--text-faint)]">
                  {s.step}·{s.px}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Corner Radii" hint="8px is the house corner.">
          <div className="flex items-end gap-[18px] rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
            {radii.map((r) => (
              <div key={r.token} className="flex flex-col items-center gap-2">
                <div
                  className="h-[62px] w-[72px] border-[1.5px] border-[var(--mf-blue-600)] bg-[var(--mf-blue-50)]"
                  style={{ borderRadius: `var(${r.token})` }}
                />
                <div className="text-[11px] tabular-nums text-[var(--text-muted)]">
                  <b className="text-[var(--text-strong)]">{r.name}</b> {r.px}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Elevation" hint="Low, cool-neutral shadows.">
          <div className="flex items-center gap-6 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-7">
            {shadows.map((sh) => (
              <div key={sh.token} className="flex flex-col items-center gap-2.5">
                <div
                  className="flex h-16 w-24 items-center justify-center rounded-md bg-white text-[11px] text-[var(--text-muted)]"
                  style={{ boxShadow: `var(${sh.token})` }}
                >
                  {sh.name.replace('shadow-', '')}
                </div>
                <div className="text-[11px] font-semibold text-[var(--text-strong)]">{sh.name}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  ),
};
