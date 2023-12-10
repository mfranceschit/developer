import React from 'react';
import Head from 'next/head';

import en from '@/locales/en';
import Title from '@/components/Title';
import styles from './about.module.scss';

const About = () => {
  const { title = '', description = [] } = en.about;

  return (
    <section className="wrapper">
      <Head>
        <title>{`Marco Franceschi 🙋🏽‍♂️ ${title}`}</title>
      </Head>
      <Title>{title}</Title>
      <div className={styles.textBlock}>
        {description.map((paragraph: string, index: number) => (
          <p key={index} className={styles.aboutTextParagraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
};

export default About;
