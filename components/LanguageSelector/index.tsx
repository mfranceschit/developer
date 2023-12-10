import React from 'react';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa6';
// import { useRouter } from 'next/router';
import Link from 'next/link';

import { LOCALES } from '@/types';
import styles from './language-selector.module.scss';

const LanguageSelector = () => {
  // const router = useRouter();
  const { asPath, locale } = { asPath: 'home', locale: 'en' };

  return (
    <div className={styles.languageSelector}>
      <div className={styles.buttonContainer}>
        {locale === LOCALES.pt && (
          <Link passHref href={asPath} locale="es">
            <FaCaretLeft />
          </Link>
        )}
        {locale === LOCALES.es && (
          <Link passHref href={asPath} locale="en">
            <FaCaretLeft />
          </Link>
        )}
      </div>
      <h4>en</h4>

      <div className={styles.buttonContainer}>
        {locale === LOCALES.es && (
          <Link passHref href={asPath} locale="pt">
            <FaCaretRight />
          </Link>
        )}
        {locale === LOCALES.en && (
          <Link passHref href={asPath} locale="es">
            <FaCaretRight />
          </Link>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
