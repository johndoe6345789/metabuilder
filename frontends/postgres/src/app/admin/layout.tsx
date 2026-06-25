import type { Metadata } from 'next';
import '@/styles/admin-global.scss';
import styles from './admin.module.scss';
import AdminI18nProvider from '@/components/admin/AdminI18nProvider';

export const metadata: Metadata = {
  title: 'Postgres Admin Panel',
  description: 'Web-based PostgreSQL admin interface',
};

// Applied before first paint so the M3 [data-theme] tokens are correct with no
// flash: a stored preference wins, otherwise follow the OS colour scheme.
const themeInitScript = `(function(){try{var t=localStorage.getItem('pg-admin-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={styles.adminShell} suppressHydrationWarning>
        <AdminI18nProvider>{children}</AdminI18nProvider>
      </body>
    </html>
  );
}
