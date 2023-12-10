import React from 'react';
import Head from 'next/head';

import Badges from '@/components/Badges';
import Title from '@/components/Title';
import { Badge } from '@/types';
import en from '@/locales/en';

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
      <Head>
        <title>{`Marco Franceschi 🏆 ${title}`}</title>
      </Head>
      <Title>{title}</Title>

      <div className="certifications-wrapper">
        <h2 className="certifications-subtitle">{certificatesTitle}</h2>
        <Badges entries={certificates as Badge[]} />

        <h2 className="certifications-subtitle">{degreesTitle}</h2>
        <Badges entries={degrees as Badge[]} />
      </div>
    </section>
  );
};

export default Certifications;
