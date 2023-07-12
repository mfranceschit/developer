import styles from './styles.module.css';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  return (
    <main className={styles.homeContainer}>
      <AnimatedTitle text="Marco Franceschi" />
      <p>Description</p>
    </main>
  );
}
