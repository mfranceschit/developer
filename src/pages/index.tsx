import { useLanguage } from '@/hooks/useLanguage';
import AnimatedTitle from '@/components/AnimatedTitle';
import Head from 'next/head';

export default function Home() {
  const {
    content: { home },
  } = useLanguage();
  const { title, subtitle } = home;

  return (
    <section className="home-container">
      <Head>
        <title>{`Marco Franceschi 🏠`}</title>
      </Head>
      <AnimatedTitle>{title}</AnimatedTitle>
      <p>{subtitle}</p>
    </section>
  );
}
