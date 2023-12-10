import React from 'react';
import Head from 'next/head';

import { useLanguage } from '@/hooks/useLanguage';

const About = () => {
  const {
    content: { about },
  } = useLanguage();
  const { title = '', description = [] } = about;

  return (
    <div className="text-wrapper">
      <Head>
        <title>{`Marco Franceschi 🙋🏽‍♂️ ${title}`}</title>
      </Head>
      <div className="text-block">
        {description.map((paragraph: string, index: number) => (
          <p key={index} className="about-text-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default About;
