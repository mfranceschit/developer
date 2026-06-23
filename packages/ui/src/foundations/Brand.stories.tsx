import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from '../components/Logo/Logo';

const meta = {
  title: 'Foundations/Brand',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">{title}</h2>
    {hint && <p className="mb-4 text-sm text-[var(--text-muted)]">{hint}</p>}
    {children}
  </section>
);

const Cell = ({ bg, label, dark, children }: { bg: string; label?: string; dark?: boolean; children: React.ReactNode }) => (
  <div className="flex min-h-[170px] flex-col items-center justify-center gap-3.5 p-6" style={{ background: bg }}>
    {children}
    {label && (
      <span
        className="text-[10px] uppercase tracking-[0.08em]"
        style={{ color: dark ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}
      >
        {label}
      </span>
    )}
  </div>
);

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-[var(--surface-page)] p-8 font-sans text-[var(--text-strong)]">
      <div className="mx-auto max-w-5xl">
        <Section title="Logo Lockups" hint="Monogram + dotless mfranceschit wordmark + tagline.">
          <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[var(--border-subtle)] sm:grid-cols-2">
            <Cell bg="var(--surface-page)">
              <Logo variant="navy" height={86} />
            </Cell>
            <Cell bg="var(--mf-bellwether-blue)">
              <Logo variant="beige" height={86} />
            </Cell>
          </div>
        </Section>

        <Section title="Monograms" hint="MF mark — curves = art, right angles = logic.">
          <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[var(--border-subtle)] sm:grid-cols-3">
            <Cell bg="var(--mf-sand)">
              <Logo variant="navy" lockup={false} height={96} />
            </Cell>
            <Cell bg="var(--mf-bellwether-blue)">
              <Logo variant="beige" lockup={false} height={96} />
            </Cell>
            <Cell bg="var(--mf-very-berry)">
              <Logo variant="beige" lockup={false} height={96} />
            </Cell>
          </div>
        </Section>

        <Section title="Approved Pairings" hint="Stay inside the palette · keep contrast.">
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-[var(--border-subtle)] sm:grid-cols-4">
            <Cell bg="var(--mf-sand)" label="Navy / Sand">
              <Logo variant="navy" lockup={false} height={62} />
            </Cell>
            <Cell bg="var(--mf-bellwether-blue)" label="Sand / Navy" dark>
              <Logo variant="beige" lockup={false} height={62} />
            </Cell>
            <Cell bg="var(--mf-very-berry)" label="Sand / Berry" dark>
              <Logo variant="beige" lockup={false} height={62} />
            </Cell>
            <Cell bg="#fff" label="Berry / White">
              <Logo variant="berry" lockup={false} height={62} />
            </Cell>
          </div>
        </Section>
      </div>
    </div>
  ),
};
