import { Metadata } from 'next';
import Image from 'next/image';

import AnimatedTitle from '@/components/AnimatedTitle';
import en from '@/locales/en';
// import { ServerComponentProps } from '@/types';
import styles from './home.module.scss';

// set dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  // TODO: set i18n locale
  const { title, description } = en.serps.home;

  return {
    title,
    description,
  };
}

const Home = () => {
  const { title, subtitle } = en.home;

  return (
    <section className={styles.container}>
      <div>
        <AnimatedTitle>{title}</AnimatedTitle>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <Image alt="Logo" width="200" height="200" src="/images/logo.png" />
    </section>
  );
};

export default Home;
