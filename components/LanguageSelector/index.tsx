'use client';

import React from 'react';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa6';
import Link from 'next/link';

import { LOCALES } from '@/types';
import styles from './language-selector.module.scss';
import { useParams, usePathname } from 'next/navigation';

const LanguageSelector = () => {
  const { locale } = useParams();
  const pathname = usePathname();
  const currentRoute = pathname.replace(`/${locale}`, '') || '/';

  return (
    <div className={styles.languageSelector}>
      <div className={styles.buttonContainer}>
        {locale === LOCALES.pt && (
          <Link passHref href={`/es${currentRoute}`} hrefLang="es">
            <FaCaretLeft />
          </Link>
        )}
        {locale === LOCALES.es && (
          <Link passHref href={`/en${currentRoute}`} hrefLang="en">
            <FaCaretLeft />
          </Link>
        )}
      </div>
      <h4>{locale}</h4>

      <div className={styles.buttonContainer}>
        {locale === LOCALES.es && (
          <Link passHref href={`/pt${currentRoute}`} hrefLang="pt">
            <FaCaretRight />
          </Link>
        )}
        {locale === LOCALES.en && (
          <Link passHref href={`/es${currentRoute}`} hrefLang="es">
            <FaCaretRight />
          </Link>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
