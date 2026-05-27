import {
  Button, Dialog, DialogHeader, DialogTitle,
  DialogContent, Alert, MaterialIcon,
} from '@metabuilder/components/fakemui'
import { motion, AnimatePresence } from 'framer-motion'
import { MarkdownRenderer } from './MarkdownRenderer'
import { LoadingAnalysis } from './LoadingAnalysis'
import { useAIErrorHelper } from './hooks/useAIErrorHelper'
import styles from './ai-error-helper.module.scss'

interface AIErrorHelperProps {
  error: Error | string
  context?: string
  className?: string
}

export function AIErrorHelper({ error, context, className }: AIErrorHelperProps) {
  const vm = useAIErrorHelper(error, context)
  const { t } = vm

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={className}
        data-testid="ai-error-helper"
        role="region"
        aria-label={t.aiErrorHelper.regionAriaLabel}
      >
        <Button
          onClick={vm.analyzeError}
          variant="outlined"
          size="sm"
          data-testid="ai-helper-btn"
          aria-label={t.aiErrorHelper.buttonAriaLabel}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            aria-hidden="true"
          >
            <MaterialIcon name="auto_awesome" size={16} />
          </motion.div>
          {t.aiErrorHelper.button}
        </Button>
      </motion.div>

      <Dialog
        open={vm.open}
        onClose={() => vm.setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogHeader style={{ paddingRight: '2rem' }}>
          <DialogTitle>
            <span
              className={styles.dialogTitleRow}
              data-testid="ai-analysis-title"
            >
              <MaterialIcon name="auto_awesome" className={styles.sparkleIcon} aria-hidden="true" />
              {t.aiErrorHelper.dialogTitle}
            </span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent
          data-testid="ai-analysis-dialog"
          className={styles.dialogContent}
        >
          <p style={{ color: 'var(--mat-sys-on-surface-variant)', marginBottom: '16px' }}>
            {t.aiErrorHelper.dialogSubtitle}
          </p>
          <div
            className={styles.scrollArea}
            role="region"
            aria-label="Error analysis results"
          >
            <Alert severity="error" variant="outlined" data-testid="error-message-alert">
              <span className={styles.errorMessageCode}>
                {vm.errorMessage}
              </span>
            </Alert>
            {vm.isAnalyzing && <LoadingAnalysis />}
            {vm.analysisError && (
              <Alert severity="error" data-testid="analysis-error-alert" role="alert">
                {vm.analysisError}
              </Alert>
            )}
            <AnimatePresence>
              {vm.analysis && <MarkdownRenderer content={vm.analysis} />}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
