'use client';

import React from 'react';
import Head from 'next/head';

import SocialButtons from '@/components/SocialButtons';
import ContactForm from '@/components/ContactForm';
import Title from '@/components/Title';
import en from '@/locales/en';
import styles from './contact.module.scss';

const Contact = () => {
  const { title, description, cta, socials, placeholderMessage, submitted } =
    en.contact;

  return (
    <section className="wrapper">
      <Head>
        <title>{`Marco Franceschi 📫 ${title}`}</title>
      </Head>
      <Title>{title}</Title>

      <div className={styles.formWrapper}>
        <ContactForm
          title={description}
          submittedMessage={submitted}
          placeholderMessage={placeholderMessage}
          cta={cta}
        />

        <div className={styles.social}>
          <p>
            {socials} <strong>mfranceschit</strong>
          </p>
          <SocialButtons size={30} />
        </div>
      </div>
    </section>
  );
};

export default Contact;
