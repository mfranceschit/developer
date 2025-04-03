import { Metadata } from 'next';

import AnimatedTitle from '@/components/AnimatedTitle';
import en from '@/locales/en';
// import { ServerComponentProps } from '@/types';
import Logo from '@/components/Logo';
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
      <div className={styles.title}>
        <AnimatedTitle>{title}</AnimatedTitle>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <Logo />
    </section>
  );
};

export default Home;
