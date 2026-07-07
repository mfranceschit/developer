import type { Meta, StoryObj } from '@storybook/react-vite';
import { darkPanel } from '../../storybook/decorators';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'TypeScript',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: { tone: 'neutral' },
};

export const Blue: Story = {
  args: { tone: 'blue' },
};

export const Berry: Story = {
  args: { tone: 'berry' },
};

export const Sand: Story = {
  args: { tone: 'sand' },
};

export const Solid: Story = {
  args: { tone: 'solid' },
};

export const Square: Story = {
  args: { tone: 'blue', pill: false },
};

export const TechStack: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {['React', 'TypeScript', 'Astro', 'Node.js', 'Tailwind'].map((tech) => (
        <Badge key={tech} tone="blue">
          {tech}
        </Badge>
      ))}
    </div>
  ),
};

/* Dark "Marea" tones — rendered over the dark page surface. */

export const Glass: Story = {
  args: { tone: 'glass', pill: false },
  decorators: [darkPanel],
};

export const TintAccent: Story = {
  args: { tone: 'tint-accent', pill: false },
  decorators: [darkPanel],
};

export const DarkProjectChips: Story = {
  decorators: [darkPanel],
  render: () => (
    <div className="flex flex-wrap gap-1.5">
      {['GraphQL', 'oclif', 'Express', 'TypeScript', 'Dgraph', 'Jest'].map((tech) => (
        <Badge key={tech} tone="glass" pill={false}>
          {tech}
        </Badge>
      ))}
    </div>
  ),
};

export const DarkStackChips: Story = {
  decorators: [darkPanel],
  render: () => (
    <div className="flex flex-wrap gap-2">
      {['TypeScript', 'Next.js', 'Docker', 'Terraform'].map((tech) => (
        <Badge key={tech} tone="tint-accent" pill={false}>
          {tech}
        </Badge>
      ))}
    </div>
  ),
};
