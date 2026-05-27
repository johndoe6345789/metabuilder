'use client'

import { Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { Snippet } from '@/lib/types'
import { SnippetDialogTabs } from './SnippetDialogTabs'
import { useSnippetEditorPage } from './hooks/useSnippetEditorPage'
import styles from './snippet-editor-page.module.scss'

interface SnippetEditorPageProps {
  initialSnippet?: Snippet | null
}

export function SnippetEditorPage({ initialSnippet }: SnippetEditorPageProps) {
  const vm = useSnippetEditorPage(initialSnippet)
  const { t, form } = vm

  return (
    <div className={styles.page} data-testid="snippet-editor-page">
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => vm.router.push('/')}
          aria-label="Back to snippets"
        >
          <MaterialIcon name="arrow_back" size={18} />
          <span>Back</span>
        </button>

        <h1 className={styles.pageTitle}>{vm.pageTitle}</h1>

        <div className={styles.topBarActions}>
          {vm.activeTab > 0 && (
            <Button
              variant="outlined"
              onClick={() => vm.setActiveTab(p => p - 1)}
              aria-label="Previous step"
            >
              {t.snippetDialog.buttons.back}
            </Button>
          )}
          {vm.activeTab < vm.tabCount - 1 ? (
            <Button
              variant="filled"
              onClick={() => vm.setActiveTab(p => p + 1)}
              aria-label="Next step"
            >
              {t.snippetDialog.buttons.next}
            </Button>
          ) : (
            <Button
              variant="filled"
              onClick={vm.handleSave}
              data-testid="editor-save-btn"
              aria-label={
                vm.isEditing ? 'Update snippet' : 'Create snippet'
              }
            >
              {vm.isEditing
                ? t.snippetDialog.buttons.update
                : t.snippetDialog.buttons.create}
            </Button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <SnippetDialogTabs
          activeTab={vm.activeTab}
          onTabChange={vm.setActiveTab}
          editorHeight="calc(100vh - 280px)"
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
      </div>
    </div>
  )
}
