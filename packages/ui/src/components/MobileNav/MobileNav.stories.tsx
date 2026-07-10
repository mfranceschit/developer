import type { Meta, StoryObj } from '@storybook/react-vite';
import { darkPanel } from '../../storybook/decorators';
import { MobileNav } from './MobileNav';

const meta: Meta<typeof MobileNav> = {
  title: 'Components/MobileNav',
  component: MobileNav,
  decorators: [darkPanel],
  args: {
    links: [
      { href: '/en/', label: 'Home', active: true },
      { href: '/en/about', label: 'About' },
      { href: '/en/projects', label: 'Projects' },
      { href: '/en/certifications', label: 'Certifications' },
      { href: '/en/contact', label: 'Contact' },
    ],
    languages: [
      { href: '/en/', label: 'EN', active: true },
      { href: '/es/', label: 'ES' },
      { href: '/pt/', label: 'PT' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof MobileNav>;

export const Default: Story = {};

export const WithoutLanguages: Story = {
  args: { languages: [] },
};
