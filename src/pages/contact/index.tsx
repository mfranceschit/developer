import React, { FormEvent } from 'react';

import Title from '@/components/Title';
import SocialButtons from '@/components/SocialButtons';
import { LOCALES } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

interface CustomElements extends HTMLFormControlsCollection {
  subject: HTMLInputElement;
  message: HTMLTextAreaElement;
}

interface ContactForm extends HTMLFormElement {
  readonly elements: CustomElements;
}

const Contact = () => {
  const { contact } = useLanguage();
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
    <section className="contact-container">
      <Title>{title}</Title>
      <div className="text-wrapper">
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
    </section>
  );
};

export default Contact;
