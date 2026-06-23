import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const scale = [
  { token: '--text-4xl', label: '44 / 700', weight: 700, tracking: '-0.03em', text: 'Build with intent' },
  { token: '--text-3xl', label: '35 / 700', weight: 700, tracking: '-0.015em', text: 'Senior Full-Stack Developer' },
  { token: '--text-2xl', label: '28 / 600', weight: 600, tracking: '0', text: 'Selected projects' },
  { token: '--text-xl', label: '22 / 600', weight: 600, tracking: '0', text: 'Certifications & degrees' },
  { token: '--text-base', label: '16 / 400', weight: 400, tracking: '0', text: 'Body — coding is a craft, where ideas become real.' },
  { token: '--text-xs', label: '12 / 500', weight: 500, tracking: '0', text: 'CAPTION · METADATA · ISSUED 2025' },
];

const weights = [
  { value: 300, label: 'LIGHT 300' },
  { value: 400, label: 'REGULAR 400' },
  { value: 500, label: 'MEDIUM 500' },
  { value: 600, label: 'SEMIBOLD 600' },
  { value: 700, label: 'BOLD 700' },
  { value: 900, label: 'BLACK 900' },
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
        <Section title="Family">
          <p className="max-w-[62ch] text-base leading-relaxed text-[var(--text-body)]">
            The typeface is <span className="font-medium">Inter</span>, exposed via{' '}
            <code className="rounded bg-[var(--surface-sunken)] px-1.5 py-0.5 font-mono text-sm">var(--font-sans)</code>. One
            letterform for headings and body — only size, weight, and tracking change.
          </p>
        </Section>

        <Section title="Type Scale" hint="Inter · display to caption.">
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4">
            {scale.map((s) => (
              <div key={s.token} className="flex items-baseline gap-6 border-b border-[var(--border-subtle)] py-4 last:border-0">
                <div className="w-28 shrink-0 font-mono text-xs tabular-nums text-[var(--text-faint)]">{s.label}</div>
                <p
                  className="flex-1 overflow-hidden whitespace-nowrap"
                  style={{ fontSize: `var(${s.token})`, fontWeight: s.weight, letterSpacing: s.tracking, lineHeight: 1.1 }}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Weights & Body" hint="Inter 300–900.">
          <div className="mb-6 flex flex-wrap gap-6">
            {weights.map((w) => (
              <div key={w.value} className="text-[26px] text-[var(--text-strong)]" style={{ fontWeight: w.value }}>
                Aa
                <small className="block text-[10px] font-medium tracking-[0.04em] text-[var(--text-faint)]">{w.label}</small>
              </div>
            ))}
          </div>
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-[var(--text-body)]">
            I am a Full-Stack Developer with over 6 years of experience. To me, coding is akin to an art form, where I
            transform ideas into reality using technology.
          </p>
        </Section>

        <Section title="Wordmark & Lettering" hint="The mfranceschit handle — wide-tracked lowercase Inter.">
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-sand)] p-8">
            <div className="inline-block">
              <div className="flex font-semibold lowercase text-[var(--mf-bellwether-blue)]" style={{ columnGap: '0.62em', fontSize: 30, lineHeight: 1.1 }}>
                {'mfranceschit'.split('').map((c, i) => (
                  <span key={`${c}-${i}`}>{c}</span>
                ))}
              </div>
              <div className="text-right text-[var(--mf-bark)]" style={{ fontSize: 30 * 0.55, marginTop: 30 * 0.07, letterSpacing: '0.01em' }}>
                developer
              </div>
            </div>
            <div className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              — Eyebrow / overline label
            </div>
          </div>
        </Section>
      </div>
    </div>
  ),
};
