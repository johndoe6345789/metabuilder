'use client'

import dynamic from 'next/dynamic'
import { InputParameter } from '@/lib/types'
import { useSplitScreenEditor } from './hooks/useSplitScreenEditor'
import { ViewModeButton } from './ViewModeButton'
import styles from './split-screen-editor.module.scss'

const MonacoEditor = dynamic(
  () => import('./MonacoEditor').then(m => ({ default: m.MonacoEditor })),
  { ssr: false },
)
const ReactPreview = dynamic(
  () =>
    import('./ReactPreview').then(m => ({ default: m.ReactPreview })),
  { ssr: false },
)
const PythonOutput = dynamic(
  () =>
    import('../python-runner/PythonOutput').then(
      m => ({ default: m.PythonOutput }),
    ),
  { ssr: false },
)

interface SplitScreenEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  functionName?: string
  inputParameters?: InputParameter[]
}

export function SplitScreenEditor({
  value,
  onChange,
  language,
  height = '500px',
  functionName,
  inputParameters,
}: SplitScreenEditorProps) {
  const vm = useSplitScreenEditor(language)

  if (!vm.isPreviewSupported) {
    return (
      <MonacoEditor
        value={value}
        onChange={onChange}
        language={language}
        height={height}
      />
    )
  }

  const previewLabel = vm.isPython ? 'Output' : 'Preview'
  const preview = vm.isPython ? (
    <PythonOutput code={value} />
  ) : (
    <ReactPreview
      code={value}
      language={language}
      functionName={functionName}
      inputParameters={inputParameters}
    />
  )

  return (
    <div className={styles.root} data-testid="split-screen-editor">
      <div className={styles.toolbar}>
        <div
          className={styles.viewModeBar}
          role="group"
          aria-label="View mode selector"
        >
          <ViewModeButton
            mode="code"
            active={vm.viewMode === 'code'}
            label="Code"
            iconName="code"
            onClick={() => vm.setViewMode('code')}
          />
          <ViewModeButton
            mode="split"
            active={vm.viewMode === 'split'}
            label="Split"
            iconName="horizontal_split"
            onClick={() => vm.setViewMode('split')}
          />
          <ViewModeButton
            mode="preview"
            active={vm.viewMode === 'preview'}
            label={previewLabel}
            iconName="visibility"
            onClick={() => vm.setViewMode('preview')}
          />
        </div>
      </div>
      <div
        style={{ height: vm.viewMode === 'split' ? 'auto' : height }}
        className={styles.editorContainer}
        data-testid={`split-screen-editor-${vm.viewMode}`}
        role="region"
        aria-label={
          vm.viewMode === 'split'
            ? 'Code editor and preview'
            : vm.viewMode === 'code' ? 'Code editor' : previewLabel
        }
      >
        {vm.viewMode === 'code' && (
          <MonacoEditor value={value} onChange={onChange} language={language} height={height} />
        )}
        {vm.viewMode === 'preview' && preview}
        {vm.viewMode === 'split' && (
          <div className={styles.splitGrid} data-testid="split-screen-grid">
            <div className={styles.splitPane} style={{ height }} data-testid="split-screen-code-pane">
              <MonacoEditor value={value} onChange={onChange} language={language} height={height} />
            </div>
            <div className={styles.splitPane} style={{ height }} data-testid="split-screen-preview-pane">
              {preview}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
