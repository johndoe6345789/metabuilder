import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'

export function LoadingAnalysis() {
  return (
    <div className="space-y-3" data-testid="loading-analysis" role="status" aria-busy="true" aria-label="Analyzing error">
      <div className="flex items-center gap-2 text-muted-foreground">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          <Sparkle className="h-4 w-4" weight="fill" />
        </motion.div>
        <span className="text-sm">Analyzing error...</span>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="h-4 bg-muted rounded"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
