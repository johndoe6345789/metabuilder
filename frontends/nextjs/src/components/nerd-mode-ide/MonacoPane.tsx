'use client'

import dynamic from 'next/dynamic'
import type { OpenFile } from './ide-types'
import s from './MonacoPane.module.scss'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
)

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: 'JetBrains Mono, monospace',
  minimap: { enabled: false },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  lineNumbers: 'on' as const,
}

interface MonacoPaneProps {
  file: OpenFile
}

export function MonacoPane({ file }: MonacoPaneProps) {
  return (
    <div className={s.wrap}>
      <MonacoEditor
        height="100%"
        language={file.language}
        value={file.content}
        theme="vs-dark"
        options={EDITOR_OPTIONS}
      />
    </div>
  )
}
