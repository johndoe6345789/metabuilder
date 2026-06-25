'use client'

import React from 'react'
import { detectLanguage } from './hooks/useSiteGenerator'
import type { GenerationResult } from './hooks/useSiteGenerator'

interface FileViewerProps {
  result: GenerationResult | null
  activeFile: string | null
  activeContent: string
  onSelectFile: (name: string) => void
}

export function SiteGeneratorFileViewer({
  result,
  activeFile,
  activeContent,
  onSelectFile,
}: FileViewerProps) {
  if (!result) {
    return <EmptyState />
  }

  return (
    <div style={{
      border:
        '1px solid var(--mat-sys-outline-variant)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <FileTabs
        files={result.files}
        activeFile={activeFile}
        onSelect={onSelectFile}
      />
      <FileContent
        content={activeContent}
        filename={activeFile ?? ''}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      padding: '48px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '12px',
      color: 'var(--mat-sys-on-surface-variant)',
      background: 'var(--mat-sys-surface-container)',
      borderRadius: '12px',
      border:
        '1px dashed var(--mat-sys-outline-variant)',
    }}>
      <div style={{ fontSize: '40px', opacity: 0.4 }}>
        ⚡
      </div>
      <p style={{
        fontSize: '14px',
        margin: 0,
        fontWeight: 500,
      }}>
        Generated files will appear here
      </p>
      <p style={{
        fontSize: '12px',
        margin: 0,
        opacity: 0.7,
      }}>
        Describe your site and click Generate
      </p>
    </div>
  )
}

function FileTabs({
  files,
  activeFile,
  onSelect,
}: {
  files: Array<{ name: string }>
  activeFile: string | null
  onSelect: (name: string) => void
}) {
  return (
    <div style={{
      display: 'flex',
      gap: 0,
      borderBottom:
        '1px solid var(--mat-sys-outline-variant)',
      overflowX: 'auto',
      background: 'var(--mat-sys-surface-container)',
    }}>
      {files.map((f) => (
        <button
          key={f.name}
          onClick={() => onSelect(f.name)}
          style={{
            padding: '8px 14px',
            border: 'none',
            borderBottom:
              activeFile === f.name
                ? '2px solid var(--mat-sys-primary)'
                : '2px solid transparent',
            background: 'transparent',
            color:
              activeFile === f.name
                ? 'var(--mat-sys-primary)'
                : 'var(--mat-sys-on-surface-variant)',
            fontSize: '12px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight:
              activeFile === f.name ? 600 : 400,
          }}
        >
          {f.name}
        </button>
      ))}
    </div>
  )
}

function FileContent({
  content,
  filename,
}: {
  content: string
  filename: string
}) {
  return (
    <pre style={{
      margin: 0,
      padding: '16px 20px',
      fontSize: '12px',
      lineHeight: 1.6,
      fontFamily:
        '"JetBrains Mono", "Fira Code", monospace',
      color: 'var(--mat-sys-on-surface)',
      background: 'var(--mat-sys-surface)',
      maxHeight: '600px',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      <code
        data-language={detectLanguage(filename)}
      >
        {content}
      </code>
    </pre>
  )
}
