import React from 'react';
import { Metadata } from 'next';

import en from '@/locales/en';
import Title from '@/components/Title';
import styles from './about.module.scss';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.about;

  return {
    title,
    description,
  };
}

const About = () => {
  const { title = '', description = [] } = en.about;

  return (
    <section className="wrapper">
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
