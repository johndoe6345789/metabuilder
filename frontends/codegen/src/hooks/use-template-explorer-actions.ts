import { useCallback } from 'react'
import { useAppSelector } from '@/store'
import { toast } from '@/components/ui/sonner'
import templateUi from '@/config/template-ui.json'

const ui = templateUi.explorer

type TemplateData = Record<string, any>

interface Template {
  id: string
  name: string
  data: TemplateData
}

const triggerJsonDownload = (data: TemplateData, filename: string) => {
  const dataStr = JSON.stringify(data, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function useTemplateExplorerActions(selectedTemplate?: Template) {
  const kvData = useAppSelector((state) => state.uiState.data)

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(ui.toasts.copySuccess)
  }, [])

  const downloadJSON = useCallback(() => {
    if (!selectedTemplate) return

    triggerJsonDownload(selectedTemplate.data, `${selectedTemplate.id}-template.json`)
    toast.success(ui.toasts.downloadSuccess)
  }, [selectedTemplate])

  const exportCurrentData = useCallback(() => {
    triggerJsonDownload({ ...kvData }, 'current-project-data.json')
    toast.success(ui.toasts.exportSuccess)
  }, [kvData])

  return {
    copyToClipboard,
    downloadJSON,
    exportCurrentData
  }
}
