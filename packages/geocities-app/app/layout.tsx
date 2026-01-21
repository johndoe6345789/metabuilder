import type { Metadata } from 'next';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: '~*~RiChArDs HoMePaGe~*~',
  description: 'WeLcOmE tO mY pErSoNaL wEbSiTe!!!1!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=VT323&family=Press+Start+2P&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
