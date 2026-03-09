'use client';

import { motion } from 'framer-motion';
import { MoleculesSection } from '@/components/molecules/MoleculesSection';
import type { Snippet } from '@/lib/types';
import { useCallback } from 'react';
import { toast } from '@metabuilder/components/fakemui';
import { createSnippet } from '@/lib/db';
import { PageLayout } from '../PageLayout';

export default function MoleculesPage() {
  const handleSaveSnippet = useCallback(async (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSnippet: Snippet = {
        ...snippetData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await createSnippet(newSnippet);
      toast.success('Component saved as snippet!');
    } catch (error) {
      console.error('Failed to save snippet:', error);
      toast.error('Failed to save snippet');
    }
  }, []);

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '8px' }}>Molecules</h2>
          <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>Simple combinations of atoms that work together as functional units</p>
        </div>
        <MoleculesSection onSaveSnippet={handleSaveSnippet} />
      </motion.div>
    </PageLayout>
  );
}
