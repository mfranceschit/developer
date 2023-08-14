import Line from '@/components/Line';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="main">{children}</main>
      <Footer />
      <Line position="top" />
      <Line position="bottom" />
      <Line position="left" />
      <Line position="right" />
    </>
  );
}
