import React from 'react';
import Head from 'next/head';

import Title from '@/components/Title';
import { useLanguage } from '@/hooks/useLanguage';

const About = () => {
  const {
    content: { about },
  } = useLanguage();
  const { title = '', description = [] } = about;

  return (
    <section className="about-container">
      <Head>
        <title>{`Marco Franceschi 🙋🏽‍♂️ ${title}`}</title>
      </Head>
      <Title>{title}</Title>
      <div className="text-wrapper">
        <div className="text-block">
          {description.map((paragraph: string, index: number) => (
            <p key={index} className="about-text-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
