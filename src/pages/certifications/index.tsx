import React from 'react';
import Head from 'next/head';

import { useLanguage } from '@/hooks/useLanguage';
import Badges from '@/components/Badges';
import { Badge } from '@/types';

const Certifications = () => {
  const {
    content: { certifications },
  } = useLanguage();
  const {
    title = '',
    certificatesTitle,
    degreesTitle,
    certificates = [],
    degrees = [],
  } = certifications;

  return (
    <div className="text-wrapper">
      <Head>
        <title>{`Marco Franceschi 🏆 ${title}`}</title>
      </Head>
      <h2 className="certifications-subtitle">{certificatesTitle}</h2>
      <Badges entries={certificates as Badge[]} />

      <h2 className="certifications-subtitle">{degreesTitle}</h2>
      <Badges entries={degrees as Badge[]} />
    </div>
  );
};

export default Certifications;
