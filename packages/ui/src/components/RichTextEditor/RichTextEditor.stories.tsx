import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PortableTextBlock } from '@portabletext/editor';
import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';

const meta: Meta<typeof RichTextEditor> = {
  title: 'Components/RichTextEditor',
  component: RichTextEditor,
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<PortableTextBlock[]>([]);
    return <RichTextEditor value={value} onValueChange={setValue} placeholder="Description…" />;
  },
};

export const WithInitialValue: Story = {
  render: () => {
    const [value, setValue] = useState<PortableTextBlock[]>([
      {
        _type: 'block',
        _key: 'block1',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span1', text: 'Hello, world!', marks: ['strong'] }],
        markDefs: [],
      },
    ]);
    return <RichTextEditor value={value} onValueChange={setValue} />;
  },
};
