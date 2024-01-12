import React from 'react';

import Badges from '@/components/Badges';
import { ServerComponentProps } from '@/types';
import { getCertifications } from '@/sanity/sanity-utils';
import styles from '../certifications.module.scss';

const Certificates: React.FC<ServerComponentProps> = async ({
  params: { locale },
}) => {
  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const { certificatesTitle } = content.certifications;

  const certificates = await getCertifications(locale);

  return (
    <div>
      <h2 className={styles.certificationsSubtitle}>{certificatesTitle}</h2>
      <Badges entries={certificates} />
    </div>
  );
};

export default Certificates;
