import { useState, useEffect } from 'react'
import { Snippet } from '@/lib/types'
import { appConfig } from '@/lib/config'
import { useSnippetForm } from '@/hooks/useSnippetForm'

interface UseSnippetDialogProps {
  open: boolean
  editingSnippet?: Snippet | null
  metadataOnly?: boolean
  onSave: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  onOpenChange: (open: boolean) => void
}

export function useSnippetDialog({
  open,
  editingSnippet,
  metadataOnly = false,
  onSave,
  onOpenChange,
}: UseSnippetDialogProps) {
  const [activeTab, setActiveTab] = useState(0)
  const form = useSnippetForm(editingSnippet, open)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setActiveTab(0)
  }, [open])

  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(
    form.language,
  )
  const showPreviewTab = !metadataOnly && isPreviewSupported && form.hasPreview
  const tabCount = metadataOnly ? 1 : showPreviewTab ? 3 : 2

  const handleCodeChange = (value: string) => {
    form.updateFileContent(form.activeFile, value)
  }

  const handleSave = () => {
    if (!form.validate()) {
      if (form.errors.code) setActiveTab(1)
      return
    }
    onSave(form.getFormData())
    form.resetForm()
    onOpenChange(false)
  }

  return {
    activeTab,
    setActiveTab,
    tabCount,
    form,
    handleCodeChange,
    handleSave,
  }
}
