'use client'

import Editor from '@monaco-editor/react'

interface MonacoEditorWrapperProps {
  height?: string
  language?: string
  value?: string
  onChange?: (value: string | undefined) => void
  theme?: string
  options?: Record<string, any>
}

export function MonacoEditorWrapper({
  height = '100%',
  language = 'plaintext',
  value = '',
  onChange,
  theme = 'vs-light',
  options,
}: MonacoEditorWrapperProps) {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      theme={theme}
      options={options}
    />
  )
}
