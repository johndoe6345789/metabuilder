import { useState, useEffect } from 'react'
import { Snippet, InputParameter } from '@/lib/types'
import { appConfig, strings } from '@/lib/config'

export function useSnippetForm(editingSnippet?: Snippet | null, open?: boolean) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState(appConfig.defaultLanguage)
  const [code, setCode] = useState('')
  const [hasPreview, setHasPreview] = useState(false)
  const [functionName, setFunctionName] = useState('')
  const [inputParameters, setInputParameters] = useState<InputParameter[]>([])
  const [errors, setErrors] = useState<{ title?: string; code?: string }>({})

  /* eslint-disable react-hooks/exhaustive-deps */
  // This effect hydrates the form when the dialog opens or when a different snippet is selected for editing.
  // The state reset is intentional user-facing behavior. We intentionally omit state setters from deps.
  useEffect(() => {
    if (editingSnippet) {
      setTitle(editingSnippet.title)
      setDescription(editingSnippet.description)
      setLanguage(editingSnippet.language)
      setCode(editingSnippet.code)
      setHasPreview(editingSnippet.hasPreview || false)
      setFunctionName(editingSnippet.functionName || '')
      setInputParameters(editingSnippet.inputParameters || [])
    } else {
      setTitle('')
      setDescription('')
      setLanguage(appConfig.defaultLanguage)
      setCode('')
      setHasPreview(false)
      setFunctionName('')
      setInputParameters([])
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

  const validate = () => {
    const newErrors: { title?: string; code?: string } = {}

    if (!title.trim()) {
      newErrors.title = strings.snippetDialog.fields.title.errorMessage
    }
    if (!code.trim()) {
      newErrors.code = strings.snippetDialog.fields.code.errorMessage
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getFormData = () => ({
    title: title.trim(),
    description: description.trim(),
    language,
    code: code.trim(),
    category: editingSnippet?.category || 'general',
    hasPreview,
    functionName: functionName.trim() || undefined,
    inputParameters: inputParameters.length > 0 ? inputParameters : undefined,
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setLanguage(appConfig.defaultLanguage)
    setCode('')
    setHasPreview(false)
    setFunctionName('')
    setInputParameters([])
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
    setTitle,
    setDescription,
    setLanguage,
    setCode,
    setHasPreview,
    setFunctionName,
    handleAddParameter,
    handleRemoveParameter,
    handleUpdateParameter,
    validate,
    getFormData,
    resetForm,
  }
}
