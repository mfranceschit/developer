import { SpeedInsights } from '@vercel/speed-insights/next';
import { DM_Sans } from 'next/font/google';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Line from '@/components/Line';
import '@/styles/globals.scss';
import { ServerComponentProps } from '@/types';

const dmsans = DM_Sans({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
});

const RootLayout = async (props: { children: React.ReactNode } & ServerComponentProps) => {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  const content = (await import(`@/locales/${locale}.ts`)).default;

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />
      </head>
      <body className={dmsans.className}>
        <Header menu={content.menu} />
        <main className="main">{children}</main>
        <Footer />
        <Line position="top" />
        <Line position="bottom" />
        <Line position="left" />
        <Line position="right" />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
