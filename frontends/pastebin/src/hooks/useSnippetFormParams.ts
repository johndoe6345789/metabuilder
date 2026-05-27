import { useState } from 'react'
import { InputParameter } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'

interface FileRef {
  files: { name: string; content: string }[]
  activeFile: string
}

export function useSnippetFormParams() {
  const [inputParameters, setInputParameters] = useState<InputParameter[]>([])

  const handleAddParameter = () => {
    setInputParameters(prev => [
      ...prev,
      { name: '', type: 'string', defaultValue: '', description: '' },
    ])
  }

  const handleRemoveParameter = (index: number) => {
    setInputParameters(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateParameter = (
    index: number,
    field: keyof InputParameter,
    value: string,
  ) => {
    setInputParameters(prev =>
      prev.map((param, i) =>
        i === index ? { ...param, [field]: value } : param
      )
    )
  }

  return {
    inputParameters,
    setInputParameters,
    handleAddParameter,
    handleRemoveParameter,
    handleUpdateParameter,
  }
}

export function validateSnippetForm(
  title: string, code: string, fileRef: FileRef, t: ReturnType<typeof useTranslation>
): { errors: { title?: string; code?: string }; valid: boolean } {
  const errors: { title?: string; code?: string } = {}
  if (!title.trim()) {
    errors.title = t.snippetDialog.fields.title.errorMessage
  }
  const entryFile =
    fileRef.files.find(f => f.name === fileRef.activeFile) ||
    fileRef.files[0]
  const entryContent = entryFile?.content.trim() || code.trim()
  if (!entryContent) {
    errors.code = t.snippetDialog.fields.code.errorMessage
  }
  return { errors, valid: Object.keys(errors).length === 0 }
}
