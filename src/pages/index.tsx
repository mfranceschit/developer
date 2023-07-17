import styles from './styles.module.css';
import { useLanguage } from '@/hooks/useLanguage';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  const { home } = useLanguage();
  const { title, subtitle } = home;

  return (
    <main className={styles.homeContainer}>
      <AnimatedTitle text={title} />
      <p>{subtitle}</p>
    </main>
  );
}
