'use client';

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

import { formspreeKey } from '@/constants/environment';
import { ContactFormProps } from './types';

const ContactForm = ({
  title,
  placeholderMessage,
  cta,
  submittedMessage,
}: ContactFormProps) => {
  const [state, handleSubmit] = useForm(formspreeKey);

  if (state.succeeded) {
    return <p>{submittedMessage}</p>;
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2 className="contact-description">{title}</h2>
      <input id="email" name="email" type="text" placeholder="Email" />
      <ValidationError prefix="Email" field="email" errors={state.errors} />
      <textarea
        id="message"
        name="message"
        rows={5}
        cols={40}
        placeholder={placeholderMessage}></textarea>
      <ValidationError prefix="Message" field="message" errors={state.errors} />
      <button type="submit" disabled={state.submitting}>
        {cta}
      </button>
    </form>
  );
};

export default ContactForm;
