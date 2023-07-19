import { useLanguage } from '@/hooks/useLanguage';
import styles from './styles.module.css';
import AnimatedTitle from '@/components/AnimatedTitle';
import { LOCALES } from '@/types';

export default function Home() {
  const { home } = useLanguage();
  const { title, subtitle } = home;

  return (
    <section className={styles.homeContainer}>
      <AnimatedTitle text={title} />
      <p>{subtitle}</p>
    </section>
  );
}
