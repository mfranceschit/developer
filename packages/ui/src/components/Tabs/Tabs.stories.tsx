import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {
    items: [
      { value: 'en', label: 'English', content: 'English content' },
      { value: 'es', label: 'Español', content: 'Contenido en español' },
      { value: 'pt', label: 'Português', content: 'Conteúdo em português' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};
