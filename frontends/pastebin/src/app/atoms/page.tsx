'use client';

import { motion } from 'framer-motion';
import { AtomsSection } from '@/components/atoms/AtomsSection';
import { useSaveSnippet } from './hooks/useSaveSnippet';
import { PageLayout } from '../PageLayout';

export default function AtomsPage() {
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
            Atoms
          </h2>
          <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
            Fundamental building blocks - basic HTML elements styled
            as reusable components
          </p>
        </div>
        <AtomsSection onSaveSnippet={handleSaveSnippet} />
      </motion.div>
    </PageLayout>
  );
}
