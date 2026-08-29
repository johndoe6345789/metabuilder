'use client'

import { useCallback, useRef, useState } from 'react'
import type { godPanelConfig } from '@/lib/packages/navigation'
import { buildDatabaseExport, exportFileName } from './database-export'
import { downloadJson } from './download-json'
import { summariseImport, type Flash } from './import-summary'
import { previewTarget, toolLevel } from './preview-targets'

export type QuickTool = (typeof godPanelConfig.tools)[number]

/** The quick-actions row: what each tool does, and what it reports. */
export function useOverviewTools(dbalVersion: string | null) {
  const importRef = useRef<HTMLInputElement | null>(null)
  const [flash, setFlash] = useState<Flash | null>(null)

  const exportDatabase = useCallback(async () => {
    try {
      const payload = await buildDatabaseExport(dbalVersion)
      downloadJson(exportFileName(), payload)
      setFlash({
        severity: 'success',
        message: 'Database export downloaded.',
      })
    } catch {
      setFlash({
        severity: 'warning',
        message: 'Database export failed. Check DBAL connectivity.',
      })
    }
  }, [dbalVersion])

  const readImportFile = useCallback(async (file: File) => {
    setFlash(summariseImport(await file.text()))
  }, [])

  const runTool = useCallback(
    (tool: QuickTool) => {
      setFlash(null)
      if (tool.action === 'exportDatabase') {
        void exportDatabase()
        return
      }
      if (tool.action === 'importDatabase') {
        importRef.current?.click()
        return
      }
      if (tool.action === 'previewLevel') {
        const target = previewTarget(
          window.location.origin,
          toolLevel(tool.params)
        )
        if (target !== null) {
          window.location.assign(target)
          return
        }
      }
      setFlash({
        severity: 'info',
        message: 'Tool action is not configured.',
      })
    },
    [exportDatabase]
  )

  return { flash, setFlash, importRef, runTool, readImportFile }
}
