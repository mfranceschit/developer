import type { Preview } from '@storybook/react';

import '../src/styles/tailwind.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) ?? 'light';
      return (
        <div
          data-theme={theme}
          style={{
            background: theme === 'dark' ? 'var(--gradient-page)' : 'var(--surface-page)',
            color: 'var(--text-body)',
            minHeight: '100vh',
            padding: '2rem',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
