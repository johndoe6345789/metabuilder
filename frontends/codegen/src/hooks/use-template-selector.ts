import { useState, useCallback } from 'react'
import { templates, type TemplateType } from '@/config/templates'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUIState, deleteUIState } from '@/store/slices/uiStateSlice'
import { toast } from '@/components/ui/sonner'
import templateUi from '@/config/template-ui.json'

const ui = templateUi.selector

interface ConfirmDialogState {
  open: boolean
  actionType: 'replace' | 'merge'
  template: TemplateType | null
}

interface TemplateCardData {
  id: TemplateType
  name: string
  description: string
  icon: string
  features: string[]
  onReplace: () => void
  onMerge: () => void
}

function formatToastDescription(actionType: 'replace' | 'merge', template: TemplateType): string {
  const description = actionType === 'replace'
    ? ui.toasts.replaceDescription
    : ui.toasts.mergeDescription
  return description.replace('{template}', template)
}

export function useTemplateSelector() {
  const dispatch = useAppDispatch()
  const kvData = useAppSelector((state) => state.uiState.data)
  const [activeTab, setActiveTab] = useState('templates')
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    actionType: 'replace',
    template: null
  })

  const clearAndLoadTemplate = useCallback((templateId: TemplateType): boolean => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return false

    for (const key of Object.keys(kvData)) {
      dispatch(deleteUIState(key))
    }

    for (const [key, value] of Object.entries(template.data)) {
      dispatch(setUIState({ key, value }))
    }
    return true
  }, [dispatch, kvData])

  const mergeTemplate = useCallback((templateId: TemplateType): boolean => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return false

    for (const [key, value] of Object.entries(template.data)) {
      const existing = kvData[key]
      if (existing && Array.isArray(existing) && Array.isArray(value)) {
        dispatch(setUIState({ key, value: [...existing, ...value] }))
      } else {
        dispatch(setUIState({ key, value }))
      }
    }
    return true
  }, [dispatch, kvData])

  const handleSelectTemplate = useCallback((templateId: TemplateType, action: 'replace' | 'merge') => {
    setConfirmDialog({ open: true, actionType: action, template: templateId })
  }, [])

  const handleConfirmLoad = useCallback(() => {
    if (!confirmDialog.template) return

    setConfirmDialog(prevState => ({ ...prevState, open: false }))
    setIsLoading(true)

    const success = confirmDialog.actionType === 'replace'
      ? clearAndLoadTemplate(confirmDialog.template)
      : mergeTemplate(confirmDialog.template)

    setIsLoading(false)

    if (success) {
      toast.success(ui.toasts.successTitle, {
        description: formatToastDescription(confirmDialog.actionType, confirmDialog.template)
      })
      window.location.reload()
    } else {
      toast.error(ui.toasts.errorTitle, {
        description: ui.toasts.errorDescription
      })
    }
  }, [confirmDialog, clearAndLoadTemplate, mergeTemplate])

  const handleDialogToggle = useCallback((open: boolean) => {
    if (!open) {
      setConfirmDialog(prevState => ({ ...prevState, open }))
    }
  }, [])

  const handleDialogCancel = useCallback(() => {
    handleDialogToggle(false)
  }, [handleDialogToggle])

  const handleTabChange = useCallback((_: any, value: string) => {
    setActiveTab(value)
  }, [])

  const templateCards: TemplateCardData[] = templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    features: template.features,
    onReplace: () => handleSelectTemplate(template.id, 'replace'),
    onMerge: () => handleSelectTemplate(template.id, 'merge'),
  }))

  const handleDialogClose = useCallback(() => {
    setConfirmDialog(prevState => ({ ...prevState, open: false }))
  }, [])

  return {
    templates: templateCards,
    isLoading,
    activeTab,
    handleTabChange,
    confirmDialog,
    handleConfirmLoad,
    handleDialogToggle,
    handleDialogCancel,
    handleDialogClose,
    ui,
  }
}
