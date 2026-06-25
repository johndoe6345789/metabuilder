'use client'

import React from 'react'
import { useSiteGenerator } from './hooks/useSiteGenerator'
import { SiteGeneratorInputPanel } from './SiteGeneratorInputPanel'
import { SiteGeneratorFileViewer } from './SiteGeneratorFileViewer'

export function SiteGenerator() {
  const {
    description,
    setDescription,
    stack,
    setStack,
    model,
    setModel,
    loading,
    error,
    result,
    activeFile,
    setActiveFile,
    activeContent,
    generate,
    downloadZip,
  } = useSiteGenerator()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--mat-sys-on-surface)',
          margin: '0 0 4px',
        }}>
          Site Generator
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--mat-sys-on-surface-variant)',
          margin: 0,
        }}>
          Describe your site and Claude will generate
          all the code
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
      }}>
        <SiteGeneratorInputPanel
          description={description}
          onDescriptionChange={setDescription}
          stack={stack}
          onStackChange={setStack}
          model={model}
          onModelChange={setModel}
          loading={loading}
          error={error}
          result={result}
          onGenerate={generate}
          onDownloadZip={downloadZip}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <SiteGeneratorFileViewer
            result={result}
            activeFile={activeFile}
            activeContent={activeContent}
            onSelectFile={setActiveFile}
          />
        </div>
      </div>
    </div>
  )
}

export default SiteGenerator
