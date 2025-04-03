import React from 'react';
import { Metadata } from 'next';

import en from '@/locales/en';
import styles from './certifications.module.scss';

interface CertificationsProps {
  children: React.ReactNode;
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

const Certifications: React.FC<CertificationsProps> = async props => {
  const { children, certificates, degrees } = props;

  return (
    <section className="wrapper">
      {children}
      <div className={styles.certificationsWrapper}>
        {certificates}
        {degrees}
      </div>
    </section>
  );
};

export default Certifications;
