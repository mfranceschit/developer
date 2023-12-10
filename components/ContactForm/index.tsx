'use client';

import React, { FormEvent } from 'react';

import { ContactFormProps, ContactFormPayload } from './types';

const ContactForm = ({
  title,
  placeholderSubject,
  placeholderMessage,
  cta,
}: ContactFormProps) => {
  const submit = (form: FormEvent<ContactFormPayload>) => {
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
    <form className="contact-form" onSubmit={submit}>
      <h2 className="contact-description">{title}</h2>

      <input name="subject" type="text" placeholder={placeholderSubject} />
      <textarea
        name="message"
        rows={5}
        cols={40}
        placeholder={placeholderMessage}></textarea>
      <button type="submit">{cta}</button>
    </form>
  );
};

export default ContactForm;
