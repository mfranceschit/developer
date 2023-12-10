import { Metadata } from 'next';

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
    <section className={styles.homeContainer}>
      <AnimatedTitle>{title}</AnimatedTitle>
      <p>{subtitle}</p>
    </section>
  );
};

export default Home;
