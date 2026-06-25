'use client'

import { motion } from 'framer-motion'
import { MoleculesSection } from '@/components/molecules/MoleculesSection'
import { useSaveSnippet } from './hooks/useSaveSnippet'
import { PageLayout } from '../PageLayout'

export default function MoleculesPage() {
  const handleSaveSnippet = useSaveSnippet()

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '1.875rem',
              lineHeight: '2.25rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              marginBottom: '8px',
            }}
          >
            Molecules
          </h2>
          <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
            Simple combinations of atoms that work together as functional units
          </p>
        </div>
        <MoleculesSection onSaveSnippet={handleSaveSnippet} />
      </motion.div>
    </PageLayout>
  )
}
