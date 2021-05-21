import { useEffect, useState } from 'react';

import defaultLanguage from '../i18n/en';

const useIntl = (lang = 'en') => {
  const [data, setData] = useState(defaultLanguage);

  useEffect(() => {
    import(`../i18n/${lang}`)
      .then((language) => setData(language.default))
      .catch(() => defaultLanguage);
  }, [lang]);

  return data;
};

export default useIntl;
