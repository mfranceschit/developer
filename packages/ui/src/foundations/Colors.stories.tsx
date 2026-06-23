import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;

type Primary = { name: string; hex: string; varName: string; use: string };

const primaries: Primary[] = [
  { name: 'Bellwether Blue', hex: '#1B2B5B', varName: '--mf-bellwether-blue', use: 'Logo · headings · nav' },
  { name: 'Very Berry', hex: '#AE2B53', varName: '--mf-very-berry', use: 'CTAs · accents only' },
  { name: 'Silver Birch', hex: '#3067F6', varName: '--mf-silver-birch', use: 'Links · info' },
];

const neutrals: Primary[] = [
  { name: 'Sand', hex: '#D3CFC7', varName: '--mf-sand', use: 'Warm canvas' },
  { name: 'Bark', hex: '#453B36', varName: '--mf-bark', use: 'Warm text' },
  { name: 'Obsidian', hex: '#000000', varName: '--mf-obsidian', use: 'Pure black' },
  { name: 'White', hex: '#FFFFFF', varName: '--mf-white', use: 'Surfaces' },
];

const blueRamp = [50, 100, 300, 500, 600, 700, 800, 900] as const;
const berryRamp = [50, 100, 300, 500, 600, 700, 800] as const;
const grayRamp = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

const textRoles = [
  { varName: '--text-strong', label: 'strong · headings' },
  { varName: '--text-body', label: 'body · paragraphs' },
  { varName: '--text-muted', label: 'muted · captions' },
  { varName: '--text-link', label: 'link · silver birch' },
  { varName: '--text-accent', label: 'accent · very berry' },
];

const surfaceRoles = [
  { varName: '--surface-page', label: 'page', dark: false },
  { varName: '--surface-sunken', label: 'sunken', dark: false },
  { varName: '--surface-sand', label: 'sand', dark: false },
  { varName: '--surface-ink', label: 'ink', dark: true },
  { varName: '--surface-ink-deep', label: 'ink deep', dark: true },
  { varName: '--accent', label: 'accent', dark: true },
];

const status = [
  { name: 'Success', hex: '#1F8A5B', varName: '--mf-success' },
  { name: 'Warning', hex: '#C9851F', varName: '--mf-warning' },
  { name: 'Danger', hex: '#AE2B53', varName: '--mf-danger' },
  { name: 'Info', hex: '#3067F6', varName: '--mf-info' },
];

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">{title}</h2>
    {hint && <p className="mb-3 text-sm text-[var(--text-muted)]">{hint}</p>}
    {!hint && <div className="mb-3" />}
    {children}
  </section>
);

const SolidSwatch = ({ name, hex, varName, use }: Primary) => (
  <div className="overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)]">
    <div className="h-20" style={{ background: `var(${varName})` }} />
    <div className="px-3 py-2">
      <div className="text-[13px] font-semibold text-[var(--text-strong)]">{name}</div>
      <div className="mt-0.5 font-mono text-xs tabular-nums text-[var(--text-muted)]">{hex}</div>
      <div className="mt-1 text-[11px] text-[var(--text-faint)]">{use}</div>
    </div>
  </div>
);

const Ramp = ({ prefix, steps }: { prefix: string; steps: readonly number[] }) => (
  <div className="flex overflow-hidden rounded-md border border-[var(--border-subtle)]">
    {steps.map((step) => (
      <div
        key={step}
        className="flex h-16 flex-1 items-end justify-center pb-1.5 text-[10px] font-semibold tabular-nums"
        style={{ background: `var(--mf-${prefix}-${step})`, color: step >= 300 ? '#fff' : 'rgba(0,0,0,0.65)' }}
      >
        {step}
      </div>
    ))}
  </div>
);

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-[var(--surface-page)] p-8 font-sans text-[var(--text-strong)]">
      <div className="mx-auto max-w-5xl">
        <Section title="Brand Primaries" hint="Very Berry is reserved for CTAs and accents — never large fills.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {primaries.map((c) => (
              <SolidSwatch key={c.name} {...c} />
            ))}
          </div>
        </Section>

        <Section title="Bellwether Blue Ramp" hint="Tints & shades of the primary.">
          <Ramp prefix="blue" steps={blueRamp} />
        </Section>

        <Section title="Very Berry Ramp" hint="Tints & shades of the accent.">
          <Ramp prefix="berry" steps={berryRamp} />
        </Section>

        <Section title="Functional Grays" hint="UI chrome neutrals, 50–900.">
          <Ramp prefix="gray" steps={grayRamp} />
        </Section>

        <Section title="Neutrals & Ink" hint="Warm sand canvas, bark, obsidian, white.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {neutrals.map((c) => (
              <SolidSwatch key={c.name} {...c} />
            ))}
          </div>
        </Section>

        <Section title="Semantic Roles" hint="How tokens map to text & surfaces.">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">Text</div>
              {textRoles.map((r) => (
                <div key={r.varName} className="mb-1.5 flex items-center gap-2 text-xs text-[var(--text-body)]">
                  <span className="h-4 w-4 rounded border border-black/10" style={{ background: `var(${r.varName})` }} />
                  {r.label}
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">Surfaces</div>
              <div className="grid grid-cols-3 gap-2">
                {surfaceRoles.map((r) => (
                  <div
                    key={r.varName}
                    className="flex h-10 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[11px]"
                    style={{ background: `var(${r.varName})`, color: r.dark ? '#fff' : 'var(--text-body)' }}
                  >
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Status Colors" hint="Success, warning, danger, info.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {status.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5 rounded-md border border-[var(--border-subtle)] px-3.5 py-3">
                <span className="h-[22px] w-[22px] rounded-full" style={{ background: `var(${s.varName})` }} />
                <div className="text-xs">
                  <span className="block text-[13px] font-semibold text-[var(--text-strong)]">{s.name}</span>
                  <span className="font-mono tabular-nums text-[var(--text-muted)]">{s.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  ),
};
