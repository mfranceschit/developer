import { SpeedInsights } from '@vercel/speed-insights/next';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Line from '@/components/Line';
import '@/styles/globals.scss';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
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
