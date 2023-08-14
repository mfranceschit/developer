import React, { FormEvent } from 'react';

import SocialButtons from '@/components/SocialButtons';
import { useLanguage } from '@/hooks/useLanguage';
import Head from 'next/head';

interface CustomElements extends HTMLFormControlsCollection {
  subject: HTMLInputElement;
  message: HTMLTextAreaElement;
}

interface ContactForm extends HTMLFormElement {
  readonly elements: CustomElements;
}

const Contact = () => {
  const {
    content: { contact },
  } = useLanguage();
  const {
    title,
    description,
    cta,
    socials,
    placeholderSubject,
    placeholderMessage,
  } = contact;

  const submit = (form: FormEvent<ContactForm>) => {
    form.preventDefault();
    const target = form.currentTarget.elements;
    const data = {
      subject: target.subject.value,
      message: target.message.value,
    };

    window.open(
      `mailto:franceschi.marco@gmail.com?subject=${data.subject}&body=${data.message}`,
    );
  };

  return (
    <div className="text-wrapper">
      <Head>
        <title>{`Marco Franceschi 📫 ${title}`}</title>
      </Head>
      <h2 className="contact-description">{description}</h2>
      <form className="contact-form" onSubmit={submit}>
        <input name="subject" type="text" placeholder={placeholderSubject} />
        <textarea
          name="message"
          rows={5}
          cols={40}
          placeholder={placeholderMessage}></textarea>
        <button type="submit">{cta}</button>
      </form>

      <div className="social">
        <p>
          {socials} <strong>mfranceschit</strong>
        </p>
        <SocialButtons size={30} />
      </div>
    </div>
  );
};

export default Contact;
