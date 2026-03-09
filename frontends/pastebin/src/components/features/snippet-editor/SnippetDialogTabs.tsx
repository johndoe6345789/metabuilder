'use client'

import { InputParameter, SnippetFile } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import { SnippetFormFields } from './SnippetFormFields'
import { CodeEditorSection } from './CodeEditorSection'
import { InputParameterList } from './InputParameterList'
import styles from './snippet-dialog-tabs.module.scss'

function DialogTabBar({ tabs, activeTab, onTabChange }: {
  tabs: string[]
  activeTab: number
  onTabChange: (i: number) => void
}) {
  return (
    <nav role="tablist" aria-label="Snippet editor sections" className={styles.tabBar}>
      {tabs.map((label, i) => (
        <button
          key={label}
          role="tab"
          id={`snippet-tab-${i}-btn`}
          data-testid={`snippet-tab-${i}-btn`}
          aria-selected={activeTab === i}
          aria-controls={`snippet-tab-${i}-panel`}
          onClick={() => onTabChange(i)}
          className={activeTab === i ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

/** Renders only when active — avoids mat-mdc-tab-body absolute positioning. */
function TabPanel({ active, index, children }: { active: boolean; index: number; children: React.ReactNode }) {
  if (!active) return null
  return (
    <section
      role="tabpanel"
      id={`snippet-tab-${index}-panel`}
      aria-labelledby={`snippet-tab-${index}-btn`}
    >
      {children}
    </section>
  )
}

export interface SnippetDialogTabsProps {
  activeTab: number
  onTabChange: (tab: number) => void
  editorHeight?: string
  metadataOnly?: boolean
  title: string
  description: string
  language: string
  code: string
  hasPreview: boolean
  functionName: string
  inputParameters: InputParameter[]
  errors: { title?: string; code?: string }
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onLanguageChange: (v: string) => void
  onCodeChange: (v: string) => void
  onPreviewChange: (v: boolean) => void
  onFunctionNameChange: (v: string) => void
  onAddParameter: () => void
  onRemoveParameter: (i: number) => void
  onUpdateParameter: (i: number, field: keyof InputParameter, value: string) => void
  files: SnippetFile[]
  activeFile: string
  onActiveFileSelect: (name: string) => void
  onFileAdd: (name: string, content?: string) => void
  onFileDelete: (name: string) => void
  onFileRename: (oldName: string, newName: string) => void
  onFileUpload: (file: File) => void
}

export function SnippetDialogTabs({
  activeTab,
  onTabChange,
  editorHeight = '360px',
  metadataOnly = false,
  title,
  description,
  language,
  code,
  hasPreview,
  functionName,
  inputParameters,
  errors,
  onTitleChange,
  onDescriptionChange,
  onLanguageChange,
  onCodeChange,
  onPreviewChange,
  onFunctionNameChange,
  onAddParameter,
  onRemoveParameter,
  onUpdateParameter,
  files,
  activeFile,
  onActiveFileSelect,
  onFileAdd,
  onFileDelete,
  onFileRename,
  onFileUpload,
}: SnippetDialogTabsProps) {
  const t = useTranslation()
  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(language)
  const showPreviewTab = !metadataOnly && isPreviewSupported && hasPreview

  const tabs = metadataOnly
    ? [t.snippetDialog.tabs.details]
    : [t.snippetDialog.tabs.details, t.snippetDialog.tabs.code, ...(showPreviewTab ? [t.snippetDialog.tabs.previewConfig] : [])]

  return (
    <>
      {!metadataOnly && <DialogTabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />}

      <TabPanel active={activeTab === 0} index={0}>
        <SnippetFormFields
          title={title}
          description={description}
          language={language}
          errors={errors}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onLanguageChange={onLanguageChange}
        />
      </TabPanel>

      {!metadataOnly && (
        <TabPanel active={activeTab === 1} index={1}>
          <CodeEditorSection
            code={code}
            language={language}
            hasPreview={hasPreview}
            functionName={functionName}
            inputParameters={inputParameters}
            errors={errors}
            onCodeChange={onCodeChange}
            onPreviewChange={onPreviewChange}
            height={editorHeight}
            files={files}
            activeFile={activeFile}
            onActiveFileSelect={onActiveFileSelect}
            onFileAdd={onFileAdd}
            onFileDelete={onFileDelete}
            onFileRename={onFileRename}
            onFileUpload={onFileUpload}
          />
        </TabPanel>
      )}

      {showPreviewTab && (
        <TabPanel active={activeTab === 2} index={2}>
          <InputParameterList
            inputParameters={inputParameters}
            functionName={functionName}
            onFunctionNameChange={onFunctionNameChange}
            onAddParameter={onAddParameter}
            onRemoveParameter={onRemoveParameter}
            onUpdateParameter={onUpdateParameter}
          />
        </TabPanel>
      )}
    </>
  )
}
