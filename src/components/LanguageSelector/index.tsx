import React from 'react';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa6';
import { useRouter } from 'next/router';

import { useLanguage } from '@/hooks/useLanguage';
import { LOCALES } from '@/types';
import Link from 'next/link';

const LanguageSelector = () => {
  const { selectedLanguage } = useLanguage();
  const router = useRouter();
  const { asPath, locale } = router;

  return (
    <div className="language-selector">
      <div className="button-container">
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
      <h4>{selectedLanguage}</h4>

      <div className="button-container">
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
