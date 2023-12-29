import React from 'react';
import { Metadata } from 'next';

import Badges from '@/components/Badges';
import Title from '@/components/Title';
import { Badge } from '@/types';
import en from '@/locales/en';
import styles from './certifications.module.scss';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.certifications;

  return {
    title,
    description,
  };
}

const Certifications = () => {
  const {
    title = '',
    certificatesTitle,
    degreesTitle,
    certificates = [],
    degrees = [],
  } = en.certifications;

  return (
    <section className="wrapper">
      <Title>{title}</Title>

      <div className={styles.certificationsWrapper}>
        <h2 className={styles.certificationsSubtitle}>{certificatesTitle}</h2>
        <Badges entries={certificates as Badge[]} />

        <h2 className={styles.certificationsSubtitle}>{degreesTitle}</h2>
        <Badges entries={degrees as Badge[]} />
      </div>
    </section>
  );
};

export default Certifications;
