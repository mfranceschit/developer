import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ImageUploader } from './ImageUploader';

const meta: Meta<typeof ImageUploader> = {
  title: 'Components/ImageUploader',
  component: ImageUploader,
};

export default meta;
type Story = StoryObj<typeof ImageUploader>;

export const Default: Story = {
  render: () => {
    const [alt, setAlt] = useState('');
    return (
      <ImageUploader
        alt={alt}
        onAltChange={setAlt}
        onUpload={async (file: File) => URL.createObjectURL(file)}
      />
    );
  },
};

export const WithExistingImage: Story = {
  render: () => {
    const [alt, setAlt] = useState('Existing photo');
    return (
      <ImageUploader
        imageUrl="https://placehold.co/400x300"
        alt={alt}
        onAltChange={setAlt}
        onUpload={async (file: File) => URL.createObjectURL(file)}
      />
    );
  },
};
