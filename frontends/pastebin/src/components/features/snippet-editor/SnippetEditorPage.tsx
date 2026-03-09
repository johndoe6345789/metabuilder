'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createSnippet, updateSnippet } from '@/store/slices/snippetsSlice'
import { selectSelectedNamespaceId } from '@/store/selectors'
import { useSnippetForm } from '@/hooks/useSnippetForm'
import { useTranslation } from '@/hooks/useTranslation'
import { appConfig } from '@/lib/config'
import { Snippet } from '@/lib/types'
import { SnippetDialogTabs } from './SnippetDialogTabs'
import { toast } from '@metabuilder/components/fakemui'
import styles from './snippet-editor-page.module.scss'

interface SnippetEditorPageProps {
  initialSnippet?: Snippet | null
}

export function SnippetEditorPage({ initialSnippet }: SnippetEditorPageProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const t = useTranslation()
  const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId)
  const [activeTab, setActiveTab] = useState(0)

  const {
    title, description, language, code, hasPreview,
    functionName, inputParameters, errors,
    files, activeFile,
    setTitle, setDescription, setLanguage, setHasPreview,
    setFunctionName, setActiveFile,
    addFile, deleteFile, updateFileContent, renameFile, uploadFile,
    handleAddParameter, handleRemoveParameter, handleUpdateParameter,
    validate, getFormData,
  } = useSnippetForm(initialSnippet)

  const isEditing = Boolean(initialSnippet?.id)
  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(language)
  const showPreviewTab = isPreviewSupported && hasPreview
  const tabCount = showPreviewTab ? 3 : 2

  const handleCodeChange = (value: string) => updateFileContent(activeFile, value)

  const handleSave = async () => {
    if (!validate()) {
      if (errors.code) setActiveTab(1)
      return
    }
    const data = getFormData()
    try {
      if (isEditing && initialSnippet) {
        await dispatch(updateSnippet({ ...initialSnippet, ...data })).unwrap()
        toast.success(t.toast.snippetUpdated)
      } else {
        await dispatch(createSnippet({
          ...data,
          namespaceId: selectedNamespaceId || undefined,
        })).unwrap()
        toast.success(t.toast.snippetCreated)
      }
      router.push('/')
    } catch {
      toast.error(t.toast.failedToSaveSnippet)
    }
  }

  const pageTitle = isEditing
    ? `${t.snippetDialog.edit.title}${initialSnippet?.title ? `: ${initialSnippet.title}` : ''}`
    : t.snippetDialog.create.title

  return (
    <div className={styles.page} data-testid="snippet-editor-page">
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => router.push('/')}
          aria-label="Back to snippets"
        >
          <MaterialIcon name="arrow_back" size={18} />
          <span>Back</span>
        </button>

        <h1 className={styles.pageTitle}>{pageTitle}</h1>

        <div className={styles.topBarActions}>
          {activeTab > 0 && (
            <Button
              variant="outlined"
              onClick={() => setActiveTab(p => p - 1)}
              aria-label="Previous step"
            >
              {t.snippetDialog.buttons.back}
            </Button>
          )}
          {activeTab < tabCount - 1 ? (
            <Button
              variant="filled"
              onClick={() => setActiveTab(p => p + 1)}
              aria-label="Next step"
            >
              {t.snippetDialog.buttons.next}
            </Button>
          ) : (
            <Button
              variant="filled"
              onClick={handleSave}
              data-testid="editor-save-btn"
              aria-label={isEditing ? 'Update snippet' : 'Create snippet'}
            >
              {isEditing ? t.snippetDialog.buttons.update : t.snippetDialog.buttons.create}
            </Button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <SnippetDialogTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          editorHeight="calc(100vh - 280px)"
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
      </div>
    </div>
  )
}
