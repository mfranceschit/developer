'use client';

import React from 'react';
import Image from 'next/image';

import { useImageSize } from '@/hooks/useImageSize';
import styles from './dynamic-size-image.module.scss';

interface Props {
  image: string;
  name: string;
  url: string;
}

const DynamicSizeImage: React.FC<Props> = ({ image, name, url }) => {
  const { width, height } = useImageSize();

  return (
    <div className={styles.imageContainer}>
      <a rel="noopener noreferrer" target="_blank" href={url}>
        <Image
          src={image}
          height={height}
          width={width}
          className={styles.cardImgPlaceholder}
          alt={`${name} project image`}
        />
      </a>
    </div>
  );
};

export default DynamicSizeImage;
