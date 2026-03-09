"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogClose, Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { Snippet } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import { useSnippetForm } from '@/hooks/useSnippetForm'
import { SnippetDialogTabs } from './SnippetDialogTabs'
import styles from './snippet-dialog.module.scss'

interface SnippetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingSnippet?: Snippet | null
  /** When true, only the Details tab is shown (no Code/Preview tabs) */
  metadataOnly?: boolean
}

export function SnippetDialog({ open, onOpenChange, onSave, editingSnippet, metadataOnly = false }: SnippetDialogProps) {
  const t = useTranslation()
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (open) setActiveTab(0)
  }, [open])

  const {
    title, description, language, code, hasPreview,
    functionName, inputParameters, errors,
    files, activeFile,
    setTitle, setDescription, setLanguage, setHasPreview,
    setFunctionName, setActiveFile,
    addFile, deleteFile, updateFileContent, renameFile, uploadFile,
    handleAddParameter, handleRemoveParameter,
    handleUpdateParameter, validate, getFormData, resetForm,
  } = useSnippetForm(editingSnippet, open)

  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(language)
  const showPreviewTab = !metadataOnly && isPreviewSupported && hasPreview
  const tabCount = metadataOnly ? 1 : (showPreviewTab ? 3 : 2)

  const handleCodeChange = (value: string) => {
    updateFileContent(activeFile, value)
  }

  const handleSave = () => {
    if (!validate()) {
      if (errors.code) setActiveTab(1)
      return
    }
    onSave(getFormData())
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="lg" fullWidth>
      <DialogClose onClick={() => onOpenChange(false)} aria-label="Close dialog">
        <MaterialIcon name="close" size={20} />
      </DialogClose>

      <DialogTitle>
        {editingSnippet?.id ? t.snippetDialog.edit.title : t.snippetDialog.create.title}
      </DialogTitle>

      <DialogContent dividers data-testid="snippet-dialog" className={styles.dialogContent}>
        <SnippetDialogTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          metadataOnly={metadataOnly}
          title={title}
          description={description}
          language={language}
          code={code}
          hasPreview={hasPreview}
          functionName={functionName}
          inputParameters={inputParameters}
          errors={errors}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onLanguageChange={setLanguage}
          onCodeChange={handleCodeChange}
          onPreviewChange={setHasPreview}
          onFunctionNameChange={setFunctionName}
          onAddParameter={handleAddParameter}
          onRemoveParameter={handleRemoveParameter}
          onUpdateParameter={handleUpdateParameter}
          files={files}
          activeFile={activeFile}
          onActiveFileSelect={setActiveFile}
          onFileAdd={addFile}
          onFileDelete={deleteFile}
          onFileRename={renameFile}
          onFileUpload={uploadFile}
        />
      </DialogContent>

      <DialogActions>
        {activeTab > 0 && (
          <Button
            variant="outlined"
            onClick={() => setActiveTab(prev => prev - 1)}
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
        {activeTab < tabCount - 1 ? (
          <Button variant="filled" onClick={() => setActiveTab(prev => prev + 1)} aria-label="Go to next tab">
            {t.snippetDialog.buttons.next}
          </Button>
        ) : (
          <Button
            variant="filled"
            onClick={handleSave}
            data-testid="snippet-dialog-save-btn"
            aria-label={editingSnippet ? "Update snippet" : "Create new snippet"}
          >
            {editingSnippet ? t.snippetDialog.buttons.update : t.snippetDialog.buttons.create}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
