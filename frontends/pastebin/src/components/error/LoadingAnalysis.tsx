import { motion } from 'framer-motion'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './loading-analysis.module.scss'

export function LoadingAnalysis() {
  const t = useTranslation()
  return (
    <div className={styles.root} data-testid="loading-analysis" role="status" aria-busy="true" aria-label="Analyzing error">
      <div className={styles.spinnerRow}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          <MaterialIcon name="auto_awesome" size={16} />
        </motion.div>
        <span className={styles.spinnerText}>{t.loadingAnalysis.text}</span>
      </div>
      <div className={styles.skeletonList}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className={styles.skeletonBar}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
