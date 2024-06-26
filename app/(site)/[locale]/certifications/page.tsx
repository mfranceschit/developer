import React from 'react';

import { Metadata } from 'next';

import Title from '@/components/Title';
import { ServerComponentProps } from '@/types';

interface CertificationsProps extends ServerComponentProps {
  certificates: React.ReactNode;
  degrees: React.ReactNode;
}

const Certifications: React.FC<CertificationsProps> = async ({
  params: { locale },
}) => {
  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const { title = '' } = content.certifications;

  return <Title>{title}</Title>;
};

export default Certifications;
