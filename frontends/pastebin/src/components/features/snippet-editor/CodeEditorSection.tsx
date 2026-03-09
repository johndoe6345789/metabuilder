'use client'

import dynamic from 'next/dynamic'
import { FormLabel, Checkbox } from '@metabuilder/components/fakemui'
import { InputParameter, SnippetFile } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { FileTree } from '@/components/features/file-tree/FileTree'
import styles from './code-editor-section.module.scss'

const MonacoEditor = dynamic(
  () => import('@/components/features/snippet-editor/MonacoEditor').then(m => ({ default: m.MonacoEditor })),
  { ssr: false }
)

const SplitScreenEditor = dynamic(
  () => import('@/components/features/snippet-editor/SplitScreenEditor').then(m => ({ default: m.SplitScreenEditor })),
  { ssr: false }
)

interface CodeEditorSectionProps {
  code: string
  language: string
  hasPreview: boolean
  functionName: string
  inputParameters: InputParameter[]
  errors: { code?: string }
  onCodeChange: (value: string) => void
  onPreviewChange: (checked: boolean) => void
  height?: string
  files: SnippetFile[]
  activeFile: string
  onActiveFileSelect: (name: string) => void
  onFileAdd: (name: string, content?: string) => void
  onFileDelete: (name: string) => void
  onFileRename: (oldName: string, newName: string) => void
  onFileUpload: (file: File) => void
}

export function CodeEditorSection({
  code,
  language,
  hasPreview,
  functionName,
  inputParameters,
  errors,
  onCodeChange,
  onPreviewChange,
  height,
  files,
  activeFile,
  onActiveFileSelect,
  onFileAdd,
  onFileDelete,
  onFileRename,
  onFileUpload,
}: CodeEditorSectionProps) {
  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(language) && language !== 'Python'
  const activeFileContent = files.find((f) => f.name === activeFile)?.content ?? code

  const handleEditorChange = (value: string) => {
    onCodeChange(value)
  }

  return (
    <div className={styles.sectionRoot}>
      <div className={styles.codeHeader}>
        <FormLabel htmlFor="code">Code *</FormLabel>
        {isPreviewSupported && (
          <label
            htmlFor="hasPreview"
            className={styles.previewLabel}
            data-testid="enable-preview-label"
          >
            <Checkbox
              id="hasPreview"
              checked={hasPreview}
              onChange={(e) => onPreviewChange(e.target.checked)}
              data-testid="enable-preview-checkbox"
              aria-label="Enable live preview"
            />
            Enable live preview
          </label>
        )}
      </div>

      <div
        className={`${styles.editorWrapper}${errors.code ? ` ${styles.editorWrapperError} border-destructive ring-2` : ''}`}
        data-testid="code-editor-container"
        role="region"
        aria-label="Code editor"
        aria-invalid={!!errors.code}
        aria-describedby={errors.code ? 'code-error' : undefined}
      >
        <div className={styles.editorInner}>
          <FileTree
            files={files}
            activeFile={activeFile}
            onFileSelect={onActiveFileSelect}
            onFileAdd={onFileAdd}
            onFileDelete={onFileDelete}
            onFileRename={onFileRename}
            onFileUpload={onFileUpload}
          />

          <div className={styles.monacoWrapper}>
            {hasPreview && isPreviewSupported ? (
              <div
                className={`${errors.code ? 'ring-2' : ''}`}
                data-testid="split-screen-editor-container"
              >
                <SplitScreenEditor
                  value={activeFileContent}
                  onChange={handleEditorChange}
                  language={language}
                  height={height ?? '500px'}
                  functionName={functionName}
                  inputParameters={inputParameters}
                />
              </div>
            ) : (
              <MonacoEditor
                value={activeFileContent}
                onChange={handleEditorChange}
                language={language}
                height={height ?? '400px'}
              />
            )}
          </div>
        </div>
      </div>

      {errors.code && (
        <p className={styles.errorText} id="code-error" data-testid="code-error-message" role="alert">
          {errors.code}
        </p>
      )}
    </div>
  )
}
