import { useMemo } from 'react'
import * as React from 'react'
import { Warning } from '@phosphor-icons/react'
import { Alert, AlertDescription } from '@metabuilder/components/fakemui'
import { AIErrorHelper } from '@/components/error/AIErrorHelper'
import { InputParameter } from '@/lib/types'
import { transformReactCode } from '@/lib/react-transform'
import { parseInputParameters } from '@/lib/parse-parameters'
import styles from './react-preview.module.scss'

interface ReactPreviewProps {
  code: string
  language: string
  functionName?: string
  inputParameters?: InputParameter[]
}

export function ReactPreview({ code, language, functionName, inputParameters }: ReactPreviewProps) {
  const { Component, error } = useMemo(() => {
    const isReactCode = ['JSX', 'TSX', 'JavaScript', 'TypeScript'].includes(language)
    if (!isReactCode) {
      return { Component: null, error: null }
    }

    try {
      const transformedComponent = transformReactCode(code, functionName)
      return { Component: transformedComponent, error: null }
    } catch (err) {
      return { Component: null, error: err instanceof Error ? err.message : 'Failed to render preview' }
    }
  }, [code, language, functionName])

  const props = useMemo(() => parseInputParameters(inputParameters), [inputParameters])

  if (!['JSX', 'TSX', 'JavaScript', 'TypeScript'].includes(language)) {
    return (
      <div
        className={`${styles.unsupportedPane} bg-muted`}
        data-testid="preview-unsupported"
        role="status"
        aria-label="Preview not available for this language"
      >
        <div className={styles.unsupportedCenter}>
          <Warning size={48} className={styles.unsupportedIcon} aria-hidden="true" />
          <p className={styles.unsupportedText}>Preview not available for {language}</p>
          <p className={styles.unsupportedSub}>Use JSX, TSX, JavaScript, or TypeScript</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={styles.errorPane}
        data-testid="preview-error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <Alert severity="error" className={styles.errorAlert} data-testid="preview-error-alert">
          <Warning size={16} aria-hidden="true" />
          <AlertDescription
            className={`${styles.errorDescription} font-mono whitespace-pre-wrap`}
            data-testid="preview-error-message"
          >
            {error}
          </AlertDescription>
        </Alert>
        <AIErrorHelper
          error={error}
          context={`React component preview rendering (Language: ${language})`}
        />
      </div>
    )
  }

  if (!Component) {
    return (
      <div
        className={styles.loadingPane}
        data-testid="preview-loading"
        role="status"
        aria-label="Loading preview"
        aria-busy="true"
      >
        <div className={styles.loadingCenter}>
          <p className={styles.loadingText}>Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.previewRoot} overflow-auto`} data-testid="react-preview-container" role="region" aria-label="React component preview">
      <div className={styles.previewContent}>
        <Component {...props} />
      </div>
    </div>
  )
}
