import { useLanguage } from '@/hooks/useLanguage';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  const { home } = useLanguage();
  const { title, subtitle } = home;

  return (
    <section className="home-container">
      <AnimatedTitle>{title}</AnimatedTitle>
      <p>{subtitle}</p>
    </section>
  );
}
