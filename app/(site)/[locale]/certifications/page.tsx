import React from 'react';
import { Metadata } from 'next';

import Badges from '@/components/Badges';
import Title from '@/components/Title';
import { ServerComponentProps } from '@/types';
import en from '@/locales/en';
import styles from './certifications.module.scss';
import { getCertifications, getDegrees } from '@/sanity/sanity-utils';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.certifications;

  return {
    title,
    description,
  };
}

const Certifications: React.FC<ServerComponentProps> = async ({
  params: { locale },
}) => {
  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const {
    title = '',
    certificatesTitle,
    degreesTitle,
  } = content.certifications;

  const certificates = await getCertifications(locale);
  const degrees = await getDegrees(locale);

  return (
    <section className="wrapper">
      <Title>{title}</Title>

      <div className={styles.certificationsWrapper}>
        <h2 className={styles.certificationsSubtitle}>{certificatesTitle}</h2>
        <Badges entries={certificates} />

        <h2 className={styles.certificationsSubtitle}>{degreesTitle}</h2>
        <Badges entries={degrees} />
      </div>
    </section>
  );
};

export default Certifications;
