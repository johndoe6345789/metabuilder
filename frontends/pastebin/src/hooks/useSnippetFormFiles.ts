import { useState } from 'react'
import { SnippetFile } from '@/lib/types'
import languageDefaultFiles from '@/data/languageDefaultFiles.json'

export function getDefaultFileName(language: string): string {
  return (
    (languageDefaultFiles as Record<string, string>)[language] ?? 'main.txt'
  )
}

export function useSnippetFormFiles(initialLanguage: string) {
  const defaultName = getDefaultFileName(initialLanguage)
  const [files, setFiles] = useState<SnippetFile[]>([
    { name: defaultName, content: '' },
  ])
  const [activeFile, setActiveFile] = useState(defaultName)

  const addFile = (name: string, content = '') => {
    setFiles(prev => [...prev, { name, content }])
    setActiveFile(name)
  }

  const deleteFile = (name: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.name !== name)
      if (activeFile === name && next.length > 0) {
        setActiveFile(next[0].name)
      }
      return next
    })
  }

  const updateFileContent = (name: string, content: string) => {
    setFiles(prev => prev.map(f => (f.name === name ? { ...f, content } : f)))
  }

  const renameFile = (oldName: string, newName: string) => {
    setFiles(prev =>
      prev.map(f => (f.name === oldName ? { ...f, name: newName } : f)),
    )
    if (activeFile === oldName) setActiveFile(newName)
  }

  const uploadFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const content = (e.target?.result as string) ?? ''
      setFiles(prev => {
        const idx = prev.findIndex(f => f.name === file.name)
        if (idx >= 0) {
          return prev.map((f, i) => (i === idx ? { ...f, content } : f))
        }
        return [...prev, { name: file.name, content }]
      })
      setActiveFile(file.name)
    }
    reader.readAsText(file)
  }

  const resetFiles = (language: string, code?: string) => {
    const name = getDefaultFileName(language)
    setFiles([{ name, content: code ?? '' }])
    setActiveFile(name)
  }

  return {
    files,
    activeFile,
    setFiles,
    setActiveFile,
    addFile,
    deleteFile,
    updateFileContent,
    renameFile,
    uploadFile,
    resetFiles,
  }
}
