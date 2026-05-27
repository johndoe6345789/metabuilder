import { useState, useEffect } from 'react'
import { Snippet } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import {
  useSnippetFormFiles,
  getDefaultFileName,
} from './useSnippetFormFiles'
import {
  useSnippetFormParams,
  validateSnippetForm,
} from './useSnippetFormParams'

export function useSnippetForm(
  editingSnippet?: Snippet | null,
  open?: boolean,
) {
  const t = useTranslation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguageRaw] = useState(appConfig.defaultLanguage)
  const [code, setCode] = useState('')
  const [hasPreview, setHasPreview] = useState(false)
  const [functionName, setFunctionName] = useState('')
  const [errors, setErrors] = useState<{
    title?: string; code?: string
  }>({})
  const fileOps = useSnippetFormFiles(appConfig.defaultLanguage)
  const params = useSnippetFormParams()

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (editingSnippet) {
      setTitle(editingSnippet.title)
      setDescription(editingSnippet.description)
      setLanguageRaw(editingSnippet.language)
      setCode(editingSnippet.code)
      setHasPreview(editingSnippet.hasPreview || false)
      setFunctionName(editingSnippet.functionName || '')
      params.setInputParameters(editingSnippet.inputParameters || [])
      if (editingSnippet.files && editingSnippet.files.length > 0) {
        fileOps.setFiles(editingSnippet.files)
        fileOps.setActiveFile(
          editingSnippet.entryPoint || editingSnippet.files[0].name
        )
      } else {
        fileOps.resetFiles(editingSnippet.language, editingSnippet.code)
      }
    } else {
      setTitle(''); setDescription('')
      setLanguageRaw(appConfig.defaultLanguage)
      setCode(''); setHasPreview(false); setFunctionName('')
      params.setInputParameters([])
      fileOps.resetFiles(appConfig.defaultLanguage)
    }
    setErrors({})
  }, [editingSnippet, open])
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleLanguageChange = (newLanguage: string) => {
    setLanguageRaw(newLanguage)
    const oldDefault = getDefaultFileName(language)
    const newDefault = getDefaultFileName(newLanguage)
    if (fileOps.files.length > 0 && fileOps.files[0].name === oldDefault) {
      fileOps.renameFile(oldDefault, newDefault)
    }
  }

  const validate = () => {
    const { errors: e, valid } = validateSnippetForm(
      title, code, fileOps, t
    )
    setErrors(e)
    return valid
  }

  const getFormData = () => {
    const entryFile =
      fileOps.files.find(f => f.name === fileOps.activeFile) ||
      fileOps.files[0]
    const entryContent = entryFile?.content.trim() || code.trim()
    return {
      title: title.trim(), description: description.trim(),
      language, code: entryContent,
      category: editingSnippet?.category || 'general',
      hasPreview,
      functionName: functionName.trim() || undefined,
      inputParameters: params.inputParameters.length > 0
        ? params.inputParameters : undefined,
      files: fileOps.files.length > 0 ? fileOps.files : undefined,
      entryPoint: fileOps.activeFile || undefined,
    }
  }

  const resetForm = () => {
    setTitle(''); setDescription('')
    setLanguageRaw(appConfig.defaultLanguage)
    setCode(''); setHasPreview(false); setFunctionName('')
    params.setInputParameters([])
    fileOps.resetFiles(appConfig.defaultLanguage)
    setErrors({})
  }

  return {
    title, description, language, code, hasPreview,
    functionName, errors,
    inputParameters: params.inputParameters,
    files: fileOps.files, activeFile: fileOps.activeFile,
    setTitle, setDescription,
    setLanguage: handleLanguageChange,
    setCode, setHasPreview, setFunctionName,
    setActiveFile: fileOps.setActiveFile,
    addFile: fileOps.addFile,
    deleteFile: fileOps.deleteFile,
    updateFileContent: (name: string, c: string) => {
      fileOps.updateFileContent(name, c)
      if (name === fileOps.activeFile) setCode(c)
    },
    renameFile: fileOps.renameFile,
    uploadFile: fileOps.uploadFile,
    handleAddParameter: params.handleAddParameter,
    handleRemoveParameter: params.handleRemoveParameter,
    handleUpdateParameter: params.handleUpdateParameter,
    validate, getFormData, resetForm,
  }
}
