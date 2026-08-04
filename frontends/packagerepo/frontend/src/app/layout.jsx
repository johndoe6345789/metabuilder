'use client';

import '../styles/globals.scss';
import Navbar from '../components/Navbar';
import StoreProvider from '../store/Provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
