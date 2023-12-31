import React from 'react';
import { Metadata } from 'next';

import SocialButtons from '@/components/SocialButtons';
import ContactForm from '@/components/ContactForm';
import Title from '@/components/Title';
import en from '@/locales/en';
import styles from './contact.module.scss';
import { ServerComponentProps } from '@/types';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.contact;

  return {
    title,
    description,
  };
}

const Contact: React.FC<ServerComponentProps> = async ({
  params: { locale },
}) => {
  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const { title, description, cta, socials, placeholderMessage, submitted } =
    content.contact;

  return (
    <section className="wrapper">
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
