import Head from 'next/head';

import AnimatedTitle from '@/components/AnimatedTitle';
import en from '@/locales/en';
import styles from './home.module.scss';

const Home = () => {
  const { title, subtitle } = en.home;

  return (
    <section className={styles.homeContainer}>
      <Head>
        <title>{`Marco Franceschi 🏠`}</title>
      </Head>
      <AnimatedTitle>{title}</AnimatedTitle>
      <p>{subtitle}</p>
    </section>
  );
};

export default Home;
