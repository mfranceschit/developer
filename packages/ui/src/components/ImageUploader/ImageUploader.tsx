import { FileUpload } from '@ark-ui/react';
import { useState } from 'react';
import { Input } from '../Input/Input';

export type ImageUploaderProps = {
  imageUrl?: string;
  alt: string;
  onAltChange: (alt: string) => void;
  onUpload: (file: File) => Promise<string>;
  onHotspotChange?: (hotspot: { x: number; y: number }) => void;
  className?: string;
};

const dropzoneClasses =
  'flex flex-col items-center justify-center gap-2 min-h-[160px] rounded-md ' +
  'border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-field)] ' +
  'cursor-pointer transition-colors duration-[120ms] hover:border-[var(--focus-ring)]';

// NOTE: onHotspotChange is not yet wired to a UI control. Wiring Ark UI's
// ImageCropper namespace here (crop rect -> normalized hotspot point) is
// substantially more work than the rest of this component and is left for a
// later plan. See task-15-report.md for details.
export function ImageUploader({
  imageUrl,
  alt,
  onAltChange,
  onUpload,
  className = '',
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      <FileUpload.Root
        accept="image/*"
        maxFiles={1}
        onFileAccept={async (details) => {
          const file = details.files[0];
          if (!file) return;
          setUploading(true);
          try {
            const uploadedUrl = await onUpload(file);
            setPreviewUrl(uploadedUrl);
          } finally {
            setUploading(false);
          }
        }}
      >
        <FileUpload.Dropzone className={dropzoneClasses}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={alt}
              className="max-h-[200px] w-auto rounded-md object-contain"
            />
          ) : (
            <span className="font-sans text-sm text-[var(--text-muted)]">
              {uploading ? 'Uploading…' : 'Drop an image or click to upload'}
            </span>
          )}
        </FileUpload.Dropzone>
        <FileUpload.HiddenInput />
      </FileUpload.Root>
      <Input
        value={alt}
        onChange={(event) => onAltChange(event.target.value)}
        placeholder="Alt text"
      />
    </div>
  );
}
