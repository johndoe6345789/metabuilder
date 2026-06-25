/**
 * useProjectIO
 *
 * Extracted from use-project-manager-dropdown.ts —
 * handles export and import of project JSON files.
 */

import { useCallback } from 'react'
import { toast } from '@/components/ui/sonner'
import {
  useProjectService,
} from '@/lib/project-service'
import type { Project } from '@/types/project'

interface UseProjectIOArgs {
  currentId: string | undefined
  currentName: string
  currentProject: Project
  onImportLoaded: (project: Project) => void
  onImportListReload: () => void
  onImportClose: () => void
}

export function useProjectIO({
  currentId,
  currentName,
  currentProject,
  onImportLoaded,
  onImportListReload,
  onImportClose,
}: UseProjectIOArgs) {
  const projectService = useProjectService()

  const handleExport = useCallback(() => {
    const id = currentId || 'export'
    const json =
      projectService.exportProjectAsJSON(id)
    const content = json
      ? json
      : JSON.stringify(
          { name: currentName, data: currentProject },
          null,
          2
        )
    const blob = new Blob([content], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download =
      `${currentName
        .replace(/\s+/g, '-')
        .toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Project exported')
  }, [
    currentId,
    currentName,
    currentProject,
    projectService,
  ])

  const handleImportFile = useCallback(
    (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const result =
          projectService.importProjectFromJSON(
            reader.result as string
          )
        if (result) {
          onImportLoaded(result.data)
          toast.success(`Imported "${result.name}"`)
          onImportListReload()
          onImportClose()
        } else {
          toast.error('Failed to import project')
        }
      }
      reader.readAsText(file)
      input.value = ''
    },
    [
      projectService,
      onImportLoaded,
      onImportListReload,
      onImportClose,
    ]
  )

  const triggerImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.addEventListener('change', handleImportFile)
    input.click()
  }, [handleImportFile])

  return { handleExport, triggerImport }
}
