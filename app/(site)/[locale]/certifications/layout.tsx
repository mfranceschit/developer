import React from 'react';
import { Metadata } from 'next';

import Title from '@/components/Title';
import { ServerComponentProps } from '@/types';
import en from '@/locales/en';
import styles from './certifications.module.scss';

interface CertificationsProps extends ServerComponentProps {
  certificates: React.ReactNode;
  degrees: React.ReactNode;
}

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.certifications;

  return {
    title,
    description,
  };
}

const Certifications: React.FC<CertificationsProps> = async ({
  params: { locale },
  certificates,
  degrees,
}) => {
  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const { title = '' } = content.certifications;

  return (
    <section className="wrapper">
      <Title>{title}</Title>
      <div className={styles.certificationsWrapper}>
        {certificates}
        {degrees}
      </div>
    </section>
  );
};

export default Certifications;
