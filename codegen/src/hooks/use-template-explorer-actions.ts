/// <reference path="../global.d.ts" />

import { useCallback } from 'react'
import { toast } from 'sonner'
import templateUi from '@/config/template-ui.json'
import type { Template } from '@/hooks/data/use-seed-templates'

const ui = templateUi.explorer

type TemplateData = Record<string, any>

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
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(ui.toasts.copySuccess)
  }, [])

  const downloadJSON = useCallback(() => {
    if (!selectedTemplate) return

    triggerJsonDownload(selectedTemplate.data, `${selectedTemplate.id}-template.json`)
    toast.success(ui.toasts.downloadSuccess)
  }, [selectedTemplate])

  const exportCurrentData = useCallback(async () => {
    const keys = await window.spark.kv.keys()
    const data: Record<string, any> = {}

    for (const key of keys) {
      data[key] = await window.spark.kv.get(key)
    }

    triggerJsonDownload(data, 'current-project-data.json')
    toast.success(ui.toasts.exportSuccess)
  }, [])

  return {
    copyToClipboard,
    downloadJSON,
    exportCurrentData
  }
}
