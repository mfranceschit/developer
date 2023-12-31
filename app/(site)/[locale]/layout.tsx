import { SpeedInsights } from '@vercel/speed-insights/next';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Line from '@/components/Line';
import '@/styles/globals.scss';
import { ServerComponentProps } from '@/types';

const RootLayout = ({
  children,
  params: { locale },
}: { children: React.ReactNode } & ServerComponentProps) => {
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
      <body>
        <Header />
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
