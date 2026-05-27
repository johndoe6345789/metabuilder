import { useState } from 'react'
import { Snippet } from '@/lib/types'

interface PrefilledData {
  title: string
  description: string
  code: string
  language: string
  category: string
}

export interface ComponentShowcaseState {
  dialogOpen: boolean
  prefilledData: PrefilledData | null
  handleSaveClick: () => void
  handleSave: (
    snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
}

export function useComponentShowcase(
  title: string,
  description: string,
  code: string,
  language: string,
  category: string,
  onSaveSnippet: (
    snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
): ComponentShowcaseState {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [prefilledData, setPrefilledData] =
    useState<PrefilledData | null>(null)

  const handleSaveClick = () => {
    setPrefilledData({ title, description, code, language, category })
    setDialogOpen(true)
  }

  const handleSave = (
    snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    onSaveSnippet(snippetData)
    setDialogOpen(false)
    setPrefilledData(null)
  }

  return { dialogOpen, prefilledData, handleSaveClick, handleSave }
}
