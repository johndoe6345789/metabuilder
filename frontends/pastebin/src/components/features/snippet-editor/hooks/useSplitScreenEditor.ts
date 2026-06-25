import { useState } from 'react'

export type ViewMode = 'split' | 'code' | 'preview'

const PREVIEW_LANGUAGES = ['JSX', 'TSX', 'JavaScript', 'TypeScript', 'Python']

export function useSplitScreenEditor(language: string) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  const isPreviewSupported = PREVIEW_LANGUAGES.includes(language)
  const isPython = language === 'Python'

  return { viewMode, setViewMode, isPreviewSupported, isPython }
}
