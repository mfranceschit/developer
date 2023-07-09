import Layout from '@/components/Layout';
import TransitionEffect from '@/components/TransitionEffect';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <Layout>
      <TransitionEffect>
        <Component {...pageProps} />
      </TransitionEffect>
    </Layout>
  );
}
