import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Postgres Admin Panel',
  description: 'Web-based PostgreSQL admin interface',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
