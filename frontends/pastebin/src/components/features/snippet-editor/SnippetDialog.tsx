'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogClose,
  Button,
  MaterialIcon,
} from '@metabuilder/components/m3'
import { Snippet } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import { SnippetDialogTabs } from './SnippetDialogTabs'
import { useSnippetDialog } from './hooks/useSnippetDialog'
import styles from './snippet-dialog.module.scss'

interface SnippetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingSnippet?: Snippet | null
  metadataOnly?: boolean
}

export function SnippetDialog({
  open,
  onOpenChange,
  onSave,
  editingSnippet,
  metadataOnly = false,
}: SnippetDialogProps) {
  const t = useTranslation()
  const vm = useSnippetDialog({
    open,
    editingSnippet,
    metadataOnly,
    onSave,
    onOpenChange,
  })
  const { form } = vm

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogClose
        onClick={() => onOpenChange(false)}
        aria-label="Close dialog"
      >
        <MaterialIcon name="close" size={20} />
      </DialogClose>

      <DialogTitle>
        {editingSnippet?.id
          ? t.snippetDialog.edit.title
          : t.snippetDialog.create.title}
      </DialogTitle>

      <DialogContent
        dividers
        data-testid="snippet-dialog"
        className={styles.dialogContent}
      >
        <SnippetDialogTabs
          activeTab={vm.activeTab}
          onTabChange={vm.setActiveTab}
          metadataOnly={metadataOnly}
          title={form.title}
          description={form.description}
          language={form.language}
          code={form.code}
          hasPreview={form.hasPreview}
          functionName={form.functionName}
          inputParameters={form.inputParameters}
          errors={form.errors}
          onTitleChange={form.setTitle}
          onDescriptionChange={form.setDescription}
          onLanguageChange={form.setLanguage}
          onCodeChange={vm.handleCodeChange}
          onPreviewChange={form.setHasPreview}
          onFunctionNameChange={form.setFunctionName}
          onAddParameter={form.handleAddParameter}
          onRemoveParameter={form.handleRemoveParameter}
          onUpdateParameter={form.handleUpdateParameter}
          files={form.files}
          activeFile={form.activeFile}
          onActiveFileSelect={form.setActiveFile}
          onFileAdd={form.addFile}
          onFileDelete={form.deleteFile}
          onFileRename={form.renameFile}
          onFileUpload={form.uploadFile}
        />
      </DialogContent>

      <DialogActions>
        {vm.activeTab > 0 && (
          <Button
            variant="outlined"
            onClick={() => vm.setActiveTab(p => p - 1)}
            aria-label="Go to previous tab"
            className={styles.backButton}
          >
            {t.snippetDialog.buttons.back}
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={() => onOpenChange(false)}
          data-testid="snippet-dialog-cancel-btn"
          aria-label="Cancel editing snippet"
        >
          {t.snippetDialog.buttons.cancel}
        </Button>
        {vm.activeTab < vm.tabCount - 1 ? (
          <Button
            variant="filled"
            onClick={() => vm.setActiveTab(p => p + 1)}
            aria-label="Go to next tab"
          >
            {t.snippetDialog.buttons.next}
          </Button>
        ) : (
          <Button
            variant="filled"
            onClick={vm.handleSave}
            data-testid="snippet-dialog-save-btn"
            aria-label={
              editingSnippet ? 'Update snippet' : 'Create new snippet'
            }
          >
            {editingSnippet
              ? t.snippetDialog.buttons.update
              : t.snippetDialog.buttons.create}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
