import React from 'react';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa6';

import { useLanguage } from '@/hooks/useLanguage';
import { LOCALES } from '@/types';

const LanguageSelector = () => {
  const { selectedLanguage, changeLanguage } = useLanguage();

  return (
    <div className="language-selector">
      <div className="button-container">
        {selectedLanguage !== LOCALES.en && (
          <button onClick={() => changeLanguage('back')}>
            <FaCaretLeft />
          </button>
        )}
      </div>
      <h4>{selectedLanguage}</h4>

      <div className="button-container">
        {selectedLanguage !== LOCALES.pt && (
          <button onClick={() => changeLanguage('next')}>
            <FaCaretRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
