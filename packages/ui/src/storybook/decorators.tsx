import type { Decorator } from '@storybook/react-vite';

/**
 * Renders a story inside the dark "Marea" theme scope over the page gradient.
 * Use for dark-only component variants/tones (glass/gradient/tint, tone="dark").
 */
export const darkPanel: Decorator = (Story) => (
  <div
    data-theme="dark"
    style={{
      background: 'var(--gradient-page)',
      padding: '2rem',
      borderRadius: 12,
    }}
  >
    <Story />
  </div>
);
