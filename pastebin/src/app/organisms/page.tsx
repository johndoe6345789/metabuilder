'use client';

import { motion } from 'framer-motion';
import { OrganismsSection } from '@/components/organisms/OrganismsSection';
import type { Snippet } from '@/lib/types';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { createSnippet } from '@/lib/db';
import { PageLayout } from '../PageLayout';

export default function OrganismsPage() {
  const handleSaveSnippet = useCallback(async (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSnippet: Snippet = {
        ...snippetData,
        id: Date.now().toString(),
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Organisms</h2>
          <p className="text-muted-foreground">Complex UI components composed of molecules and atoms</p>
        </div>
        <OrganismsSection onSaveSnippet={handleSaveSnippet} />
      </motion.div>
    </PageLayout>
  );
}
