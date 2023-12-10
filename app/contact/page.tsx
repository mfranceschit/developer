'use client';

import React from 'react';
import Head from 'next/head';

import SocialButtons from '@/components/SocialButtons';
import ContactForm from '@/components/ContactForm';
import Title from '@/components/Title';
import en from '@/locales/en';

const Contact = () => {
  const {
    title,
    description,
    cta,
    socials,
    placeholderSubject,
    placeholderMessage,
  } = en.contact;

  return (
    <section className="wrapper">
      <Head>
        <title>{`Marco Franceschi 📫 ${title}`}</title>
      </Head>
      <Title>{title}</Title>

      <div className="form-wrapper">
        <ContactForm
          title={description}
          placeholderSubject={placeholderSubject}
          placeholderMessage={placeholderMessage}
          cta={cta}
        />

        <div className="social">
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
