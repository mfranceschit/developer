import React from 'react';
import Head from 'next/head';

import Title from '@/components/Title';
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
    <section className="certifications-container">
      <Head>
        <title>{`Marco Franceschi 🏆 ${title}`}</title>
      </Head>
      <Title>{title}</Title>
      <div className="text-wrapper">
        <h2 className="certifications-subtitle">{certificatesTitle}</h2>
        <Badges entries={certificates as Badge[]} />

        <h2 className="certifications-subtitle">{degreesTitle}</h2>
        <Badges entries={degrees as Badge[]} />
      </div>
    </section>
  );
};

export default Certifications;
