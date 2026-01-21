import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
