import { Avatar as ArkAvatar } from '@ark-ui/react';
import type { CSSProperties } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | number;
export type AvatarSkin = 'sand' | 'navy' | 'berry';

export type AvatarProps = {
  size?: AvatarSize;
  skin?: AvatarSkin;
  src?: string;
  initials?: string;
  base?: string;
  alt?: string;
  style?: CSSProperties;
};

const SIZES: Record<Exclude<AvatarSize, number>, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

const SKINS: Record<AvatarSkin, { bg: string; mono: string }> = {
  sand:  { bg: 'var(--mf-sand)',            mono: 'monogram-navy.svg' },
  navy:  { bg: 'var(--mf-bellwether-blue)', mono: 'monogram-beige.svg' },
  berry: { bg: 'var(--mf-very-berry)',      mono: 'monogram-beige.svg' },
};

export function Avatar({
  size = 'md',
  skin = 'sand',
  src,
  initials,
  base = '/assets/logos',
  alt = 'mfranceschit',
  style,
}: AvatarProps) {
  const px = typeof size === 'number' ? size : SIZES[size];
  const s = SKINS[skin];

  return (
    <ArkAvatar.Root
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: s.bg,
        color: 'var(--text-inverse)',
        fontWeight: 'var(--weight-bold)',
        fontSize: px * 0.4,
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      <ArkAvatar.Image
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <ArkAvatar.Fallback
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {initials ?? (
          <img
            src={`${base}/${s.mono}`}
            alt={alt}
            aria-hidden="true"
            style={{ width: '62%', height: '62%', objectFit: 'contain' }}
          />
        )}
      </ArkAvatar.Fallback>
    </ArkAvatar.Root>
  );
}
