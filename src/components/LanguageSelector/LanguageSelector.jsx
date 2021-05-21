import React from 'react';

import Button from 'react-bootstrap/Button'


const LanguageSelector = ({ language, changeLanguage }) => {

  return (
    <Button className="cta-btn cta-btn--hero cta-btn--language" onClick={() => changeLanguage()}>{language}</Button>
  );
};

export default LanguageSelector;
