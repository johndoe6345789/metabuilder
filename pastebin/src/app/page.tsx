'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PageLayout } from './PageLayout';

// Dynamically import SnippetManagerRedux to avoid SSR issues with Pyodide
const SnippetManagerRedux = dynamic(
  () => import('@/components/SnippetManagerRedux').then(mod => ({ default: mod.SnippetManagerRedux })),
  { ssr: false }
);

export default function HomePage() {
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Snippets</h1>
          <p className="text-muted-foreground">Save, organize, and share your code snippets</p>
        </div>
        <SnippetManagerRedux />
      </motion.div>
    </PageLayout>
  );
}
