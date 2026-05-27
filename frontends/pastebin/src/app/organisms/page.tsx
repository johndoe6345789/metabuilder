'use client';

import { motion } from 'framer-motion';
import { OrganismsSection } from '@/components/organisms/OrganismsSection';
import { useSaveSnippet } from './hooks/useSaveSnippet';
import { PageLayout } from '../PageLayout';

export default function OrganismsPage() {
  const handleSaveSnippet = useSaveSnippet();

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '1.875rem',
            lineHeight: '2.25rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            marginBottom: '8px',
          }}>
            Organisms
          </h2>
          <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
            Complex UI components composed of molecules and atoms
          </p>
        </div>
        <OrganismsSection onSaveSnippet={handleSaveSnippet} />
      </motion.div>
    </PageLayout>
  );
}
