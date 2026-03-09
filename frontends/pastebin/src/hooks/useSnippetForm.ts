import { useState, useEffect } from 'react'
import { Snippet, SnippetFile, InputParameter } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'

function getDefaultFileName(language: string): string {
  const map: Record<string, string> = {
    Python: 'main.py',
    JavaScript: 'index.js',
    TypeScript: 'index.ts',
    Java: 'Main.java',
    'C++': 'main.cpp',
    C: 'main.c',
    Go: 'main.go',
    Rust: 'main.rs',
    Ruby: 'main.rb',
    Swift: 'main.swift',
    Kotlin: 'Main.kt',
    PHP: 'index.php',
    'C#': 'Program.cs',
    HTML: 'index.html',
    CSS: 'style.css',
    SQL: 'query.sql',
    'SQL (SQLite)': 'query.sql',
    'SQL (MySQL)': 'query.sql',
    'SQL (PostgreSQL)': 'query.sql',
    Bash: 'script.sh',
    YAML: 'config.yaml',
    JSON: 'data.json',
    Markdown: 'README.md',
  }
  return map[language] ?? 'main.txt'
}

export function useSnippetForm(editingSnippet?: Snippet | null, open?: boolean) {
  const t = useTranslation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState(appConfig.defaultLanguage)
  const [code, setCode] = useState('')
  const [hasPreview, setHasPreview] = useState(false)
  const [functionName, setFunctionName] = useState('')
  const [inputParameters, setInputParameters] = useState<InputParameter[]>([])
  const [errors, setErrors] = useState<{ title?: string; code?: string }>({})
  const [files, setFiles] = useState<SnippetFile[]>([])
  const [activeFile, setActiveFile] = useState('')

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (editingSnippet) {
      setTitle(editingSnippet.title)
      setDescription(editingSnippet.description)
      setLanguage(editingSnippet.language)
      setCode(editingSnippet.code)
      setHasPreview(editingSnippet.hasPreview || false)
      setFunctionName(editingSnippet.functionName || '')
      setInputParameters(editingSnippet.inputParameters || [])

      if (editingSnippet.files && editingSnippet.files.length > 0) {
        setFiles(editingSnippet.files)
        const entry = editingSnippet.entryPoint || editingSnippet.files[0].name
        setActiveFile(entry)
      } else {
        const defaultName = getDefaultFileName(editingSnippet.language)
        setFiles([{ name: defaultName, content: editingSnippet.code }])
        setActiveFile(defaultName)
      }
    } else {
      setTitle('')
      setDescription('')
      setLanguage(appConfig.defaultLanguage)
      setCode('')
      setHasPreview(false)
      setFunctionName('')
      setInputParameters([])

      const defaultName = getDefaultFileName(appConfig.defaultLanguage)
      setFiles([{ name: defaultName, content: '' }])
      setActiveFile(defaultName)
    }
    setErrors({})
  }, [editingSnippet, open])
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleAddParameter = () => {
    setInputParameters((prev) => [
      ...prev,
      { name: '', type: 'string', defaultValue: '', description: '' },
    ])
  }

  const handleRemoveParameter = (index: number) => {
    setInputParameters((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateParameter = (index: number, field: keyof InputParameter, value: string) => {
    setInputParameters((prev) =>
      prev.map((param, i) => (i === index ? { ...param, [field]: value } : param))
    )
  }

  const addFile = (name: string, content = '') => {
    setFiles((prev) => [...prev, { name, content }])
    setActiveFile(name)
  }

  const deleteFile = (name: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.name !== name)
      if (activeFile === name && next.length > 0) {
        setActiveFile(next[0].name)
      }
      return next
    })
  }

  const updateFileContent = (name: string, content: string) => {
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, content } : f)))
    if (name === activeFile) setCode(content)
  }

  const renameFile = (oldName: string, newName: string) => {
    setFiles((prev) => prev.map((f) => (f.name === oldName ? { ...f, name: newName } : f)))
    if (activeFile === oldName) setActiveFile(newName)
  }

  const uploadFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = (e.target?.result as string) ?? ''
      setFiles((prev) => {
        const idx = prev.findIndex((f) => f.name === file.name)
        if (idx >= 0) {
          return prev.map((f, i) => (i === idx ? { ...f, content } : f))
        }
        return [...prev, { name: file.name, content }]
      })
      setActiveFile(file.name)
    }
    reader.readAsText(file)
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    // Rename first file to match new language's default extension if it has the old default name
    const oldDefault = getDefaultFileName(language)
    const newDefault = getDefaultFileName(newLanguage)
    if (files.length > 0 && files[0].name === oldDefault) {
      renameFile(oldDefault, newDefault)
    }
  }

  const validate = () => {
    const newErrors: { title?: string; code?: string } = {}

    if (!title.trim()) {
      newErrors.title = t.snippetDialog.fields.title.errorMessage
    }

    const entryFile = files.find((f) => f.name === activeFile) || files[0]
    const entryContent = entryFile?.content.trim() || code.trim()
    if (!entryContent) {
      newErrors.code = t.snippetDialog.fields.code.errorMessage
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getFormData = () => {
    const entryFile = files.find((f) => f.name === activeFile) || files[0]
    const entryContent = entryFile?.content.trim() || code.trim()
    return {
      title: title.trim(),
      description: description.trim(),
      language,
      code: entryContent,
      category: editingSnippet?.category || 'general',
      hasPreview,
      functionName: functionName.trim() || undefined,
      inputParameters: inputParameters.length > 0 ? inputParameters : undefined,
      files: files.length > 0 ? files : undefined,
      entryPoint: activeFile || undefined,
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setLanguage(appConfig.defaultLanguage)
    setCode('')
    setHasPreview(false)
    setFunctionName('')
    setInputParameters([])
    const defaultName = getDefaultFileName(appConfig.defaultLanguage)
    setFiles([{ name: defaultName, content: '' }])
    setActiveFile(defaultName)
    setErrors({})
  }

  return {
    title,
    description,
    language,
    code,
    hasPreview,
    functionName,
    inputParameters,
    errors,
    files,
    activeFile,
    setTitle,
    setDescription,
    setLanguage: handleLanguageChange,
    setCode,
    setHasPreview,
    setFunctionName,
    setActiveFile,
    addFile,
    deleteFile,
    updateFileContent,
    renameFile,
    uploadFile,
    handleAddParameter,
    handleRemoveParameter,
    handleUpdateParameter,
    validate,
    getFormData,
    resetForm,
  }
}
