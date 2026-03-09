'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PageLayout } from './PageLayout';
import { useTranslation } from '@/hooks/useTranslation';

// Dynamically import SnippetManagerRedux (client-only — uses Redux, Monaco, etc.)
const SnippetManagerRedux = dynamic(
  () => import('@/components/SnippetManagerRedux').then(mod => ({ default: mod.SnippetManagerRedux })),
  { ssr: false }
);

export default function HomePage() {
  const t = useTranslation()
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--mat-sys-headline-large-font)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: 'var(--mat-sys-on-surface)' }}>{t.page.heading}</h1>
          <p style={{ color: 'var(--mat-sys-on-surface-variant)', fontSize: '1rem', marginBottom: 0 }}>{t.page.subtitle}</p>
        </div>
        <SnippetManagerRedux />
      </motion.div>
    </PageLayout>
  );
}
