'use client';

import '@shared/scss/globals.scss';

/** @brief Root layout with M3 design tokens. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
