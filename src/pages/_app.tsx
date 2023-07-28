import Layout from '@/components/Layout';
import TransitionEffect from '@/components/TransitionEffect';
import Context from '@/context';
import './globals.scss';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <Context>
      <Layout>
        <TransitionEffect>
          <Component {...pageProps} />
        </TransitionEffect>
      </Layout>
    </Context>
  );
}
