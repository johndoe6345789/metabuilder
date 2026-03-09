"use client"

import { Button, Dialog, DialogHeader, DialogTitle, DialogContent, DialogActions, DialogClose, Input, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './namespace-dialog.module.scss'

interface CreateNamespaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  namespaceName: string
  onNamespaceNameChange: (name: string) => void
  onCreateNamespace: () => void
  loading: boolean
}

export function CreateNamespaceDialog({
  open,
  onOpenChange,
  namespaceName,
  onNamespaceNameChange,
  onCreateNamespace,
  loading,
}: CreateNamespaceDialogProps) {
  const t = useTranslation()
  return (
    <>
      <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
        <DialogClose onClick={() => onOpenChange(false)} aria-label={t.common.close}>
          <MaterialIcon name="close" size={20} />
        </DialogClose>
        <DialogHeader>
          <DialogTitle>{t.namespace.create.title}</DialogTitle>
        </DialogHeader>
        <DialogContent data-testid="create-namespace-dialog">
          <p className={styles.description}>{t.namespace.create.description}</p>
          <div className={styles.formContent}>
            <Input
              placeholder={t.namespace.create.namePlaceholder}
              value={namespaceName}
              onChange={(e) => onNamespaceNameChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCreateNamespace()}
              data-testid="namespace-name-input"
              aria-label={t.namespace.create.namePlaceholder}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => onOpenChange(false)}
            data-testid="create-namespace-cancel-btn"
          >
            {t.common.cancel}
          </Button>
          <Button
            variant="filled"
            onClick={onCreateNamespace}
            disabled={loading}
            data-testid="create-namespace-save-btn"
          >
            {t.common.create}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
