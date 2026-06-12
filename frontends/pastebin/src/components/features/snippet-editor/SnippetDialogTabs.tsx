'use client'

import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import { SnippetFormFields } from './SnippetFormFields'
import { CodeEditorSection } from './CodeEditorSection'
import { InputParameterList } from './InputParameterList'
import { DialogTabBar, TabPanel } from './SnippetDialogTabBar'
import type { SnippetDialogTabsProps } from './snippet-editor.types'

export type { SnippetDialogTabsProps }

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
  const isPreviewSupported =
    appConfig.previewEnabledLanguages.includes(language)
  const showPreviewTab = !metadataOnly && isPreviewSupported && hasPreview

  const tabs = metadataOnly
    ? [t.snippetDialog.tabs.details]
    : [
        t.snippetDialog.tabs.details,
        t.snippetDialog.tabs.code,
        ...(showPreviewTab ? [t.snippetDialog.tabs.previewConfig] : []),
      ]

  return (
    <>
      {!metadataOnly && (
        <DialogTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}

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
