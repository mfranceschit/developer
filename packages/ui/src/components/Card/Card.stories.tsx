import type { Meta, StoryObj } from '@storybook/react-vite';
import { darkPanel } from '../../storybook/decorators';
import { Badge } from '../Badge/Badge';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const ProjectCard: Story = {
  render: () => (
    <Card as="a" interactive href="#">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <span className="text-[17px] font-semibold text-[var(--mf-gray-900)]">
            Client Portal
          </span>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['React', 'TanStack', 'Zustand'].map((tech) => (
              <Badge key={tech} tone="neutral">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
        <span className="text-sm font-semibold text-silver-birch whitespace-nowrap mt-0.5 shrink-0">
          View →
        </span>
      </div>
    </Card>
  ),
};

export const CertificationCard: Story = {
  render: () => (
    <Card as="li">
      <div className="flex items-center gap-4 p-4">
        <div
          className="w-12 h-12 rounded-md shrink-0 flex items-center justify-center"
          style={{ background: 'var(--mf-sand)' }}
        >
          <img src="/monogram-navy.svg" alt="MFT" style={{ height: 28, width: 'auto' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--mf-gray-900)] text-sm">
            AWS Certified Solutions Architect
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Amazon Web Services</p>
        </div>
        <span className="text-xs text-[var(--text-faint)] tabular-nums shrink-0">2025</span>
      </div>
    </Card>
  ),
};

export const Static: Story = {
  render: () => (
    <Card>
      <div className="p-5 text-[var(--text-body)]">A plain, non-interactive card.</div>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive>
      <div className="p-5 text-[var(--text-body)]">Hover me — border and shadow respond.</div>
    </Card>
  ),
};

/* Dark "Marea" tone — near-opaque panels that float over the animated background. */

export const DarkProjectCard: Story = {
  decorators: [darkPanel],
  render: () => (
    <Card
      as="a"
      tone="dark"
      interactive
      href="#"
      className="flex items-start justify-between gap-4 px-6 py-[22px]"
    >
      <div className="min-w-0">
        <span className="text-[17px] font-semibold text-[var(--text-heading)]">CloudGraph</span>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['GraphQL', 'TypeScript', 'Dgraph'].map((tech) => (
            <Badge key={tech} tone="glass" pill={false}>
              {tech}
            </Badge>
          ))}
        </div>
      </div>
      <span className="mt-0.5 shrink-0 whitespace-nowrap text-[14px] font-semibold text-[var(--accent-birch-500)]">
        View →
      </span>
    </Card>
  ),
};

export const DarkCertificationRow: Story = {
  decorators: [darkPanel],
  render: () => (
    <Card
      as="li"
      tone="dark"
      interactive
      hoverLift={false}
      className="flex items-center gap-4 px-[18px] py-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-sand">
        <img src="/monogram-navy.svg" alt="" aria-hidden className="h-7 w-auto" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-[var(--text-heading)]">
          AWS Solutions Architect — Associate
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">Amazon Web Services</p>
      </div>
      <div className="flex shrink-0 items-center gap-[14px]">
        <span className="text-[12px] tabular-nums text-[var(--text-faint)]">2024</span>
        <a href="#" className="text-[13px] font-medium text-[var(--accent-birch-500)] no-underline">
          View →
        </a>
      </div>
    </Card>
  ),
};
