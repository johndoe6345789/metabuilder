'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { InputParameter } from '@/lib/types'
import styles from './split-screen-editor.module.scss'

const MonacoEditor = dynamic(
  () => import('@/components/features/snippet-editor/MonacoEditor').then(m => ({ default: m.MonacoEditor })),
  { ssr: false }
)

const ReactPreview = dynamic(
  () => import('@/components/features/snippet-editor/ReactPreview').then(m => ({ default: m.ReactPreview })),
  { ssr: false }
)

const PythonOutput = dynamic(
  () => import('@/components/features/python-runner/PythonOutput').then(m => ({ default: m.PythonOutput })),
  { ssr: false }
)

interface SplitScreenEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  functionName?: string
  inputParameters?: InputParameter[]
}

type ViewMode = 'split' | 'code' | 'preview'

export function SplitScreenEditor({ 
  value, 
  onChange, 
  language, 
  height = '500px',
  functionName,
  inputParameters,
}: SplitScreenEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  const isPreviewSupported = ['JSX', 'TSX', 'JavaScript', 'TypeScript', 'Python'].includes(language)
  const isPython = language === 'Python'

  if (!isPreviewSupported) {
    return (
      <MonacoEditor
        value={value}
        onChange={onChange}
        language={language}
        height={height}
      />
    )
  }

  return (
    <div className={styles.root} data-testid="split-screen-editor">
      <div className={styles.toolbar}>
        <div className={styles.viewModeBar} role="group" aria-label="View mode selector">
          <Button
            variant={viewMode === 'code' ? 'filled' : 'text'}
            size="sm"
            onClick={() => setViewMode('code')}
            className={styles.viewModeBtn}
            data-testid="view-mode-code-btn"
            aria-label="Code"
            aria-pressed={viewMode === 'code'}
          >
            <MaterialIcon name="code" className={styles.iconSm} aria-hidden="true" />
            <span className={styles.btnLabel}>Code</span>
          </Button>
          <Button
            variant={viewMode === 'split' ? 'filled' : 'text'}
            size="sm"
            onClick={() => setViewMode('split')}
            className={styles.viewModeBtn}
            data-testid="view-mode-split-btn"
            aria-label="Split"
            aria-pressed={viewMode === 'split'}
          >
            <MaterialIcon name="horizontal_split" className={styles.iconSm} aria-hidden="true" />
            <span className={styles.btnLabel}>Split</span>
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'filled' : 'text'}
            size="sm"
            onClick={() => setViewMode('preview')}
            className={styles.viewModeBtn}
            data-testid="view-mode-preview-btn"
            aria-label={isPython ? 'Output' : 'Preview'}
            aria-pressed={viewMode === 'preview'}
          >
            <MaterialIcon name="visibility" className={styles.iconSm} aria-hidden="true" />
            <span className={styles.btnLabel}>{isPython ? 'Output' : 'Preview'}</span>
          </Button>
        </div>
      </div>

      <div
        style={{ height: viewMode === 'split' ? 'auto' : height }}
        className={styles.editorContainer}
        data-testid={`split-screen-editor-${viewMode}`}
        role="region"
        aria-label={`${viewMode === 'code' ? 'Code editor' : viewMode === 'preview' ? (isPython ? 'Python output' : 'Preview') : 'Code editor and preview'}`}
      >
        {viewMode === 'code' && (
          <MonacoEditor
            value={value}
            onChange={onChange}
            language={language}
            height={height}
          />
        )}

        {viewMode === 'preview' && (
          isPython ? (
            <PythonOutput code={value} />
          ) : (
            <ReactPreview
              code={value}
              language={language}
              functionName={functionName}
              inputParameters={inputParameters}
            />
          )
        )}

        {viewMode === 'split' && (
          <div className={styles.splitGrid} data-testid="split-screen-grid">
            <div className={styles.splitPane} style={{ height }} data-testid="split-screen-code-pane">
              <MonacoEditor
                value={value}
                onChange={onChange}
                language={language}
                height={height}
              />
            </div>
            <div className={styles.splitPane} style={{ height }} data-testid="split-screen-preview-pane">
              {isPython ? (
                <PythonOutput code={value} />
              ) : (
                <ReactPreview
                  code={value}
                  language={language}
                  functionName={functionName}
                  inputParameters={inputParameters}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
