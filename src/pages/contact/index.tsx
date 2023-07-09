import React, { FormEvent } from 'react';

import Title from '@/components/Title';
import SocialButtons from '@/components/SocialButtons';
import styles from './styles.module.css';

interface CustomElements extends HTMLFormControlsCollection {
  subject: HTMLInputElement;
  message: HTMLTextAreaElement;
}

interface ContactForm extends HTMLFormElement {
  readonly elements: CustomElements;
}

const Contact = () => {
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
    <section className={styles.contactContainer}>
      <Title>Contact</Title>
      <div className={styles.textWrapper}>
        <h2 className="contact-wrapper__text">
          Would you like to work together?
        </h2>
        <form className={styles.contactForm} onSubmit={submit}>
          <input name="subject" type="text" placeholder="Subject" />
          <textarea
            name="message"
            rows={5}
            cols={40}
            placeholder="Message"></textarea>
          <button type="submit">Let&#39;s Talk!</button>
        </form>

        <div className={styles.social}>
          <p>
            Find me on social media as <strong>mfranceschit</strong>
          </p>
          <SocialButtons size={30} />
        </div>
      </div>
    </section>
  );
};

export default Contact;
