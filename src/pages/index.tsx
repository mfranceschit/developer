import Link from 'next/link';

import styles from './styles.module.css';
import Title from '@/components/Title';

export default function Home() {
  return (
    <main className={styles.homeContainer}>
      <Title>Marco Franceschi</Title>
      <p>Description</p>
    </main>
  );
}
