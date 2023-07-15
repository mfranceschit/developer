import Layout from '@/components/Layout';
import TransitionEffect from '@/components/TransitionEffect';
import Context from '@/context';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <Layout>
      <TransitionEffect>
        <Context>
          <Component {...pageProps} />
        </Context>
      </TransitionEffect>
    </Layout>
  );
}
