import React from 'react';
import { Metadata } from 'next';

import Title from '@/components/Title';
import en from '@/locales/en';
import { ServerComponentProps } from '@/types';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.contact;

  return {
    title,
    description,
  };
}

const Certifications: React.FC<ServerComponentProps> = async props => {
  const params = await props.params;

  const { locale } = params;

  // TODO: Improve reusable code here
  const content = (await import(`@/locales/${locale}.ts`)).default;
  const { title = '' } = content.certifications;

  return <Title>{title}</Title>;
};

export default Certifications;
