import React from 'react';

import Badges from '@/components/Badges';
import { ServerComponentProps } from '@/types';
import { getDegrees } from '@/sanity/sanity-utils';
import styles from '../certifications.module.scss';

const Degrees: React.FC<ServerComponentProps> = async props => {
  const params = await props.params;

  const {
    locale
  } = params;

  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const { degreesTitle } = content.certifications;

  const degrees = await getDegrees(locale);

  return (
    <div>
      <h2 className={styles.certificationsSubtitle}>{degreesTitle}</h2>
      <Badges entries={degrees} />
    </div>
  );
};

export default Degrees;
