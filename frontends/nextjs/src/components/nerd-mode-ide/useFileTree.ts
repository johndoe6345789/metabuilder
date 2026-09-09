'use client'

import { useCallback, useMemo, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import type { GodState } from '@/store/slices/god-slice'
import { useCurrentTenantScope } from '@/app/[tenantSlug]/panel/god/tabs/use-current-tenant-scope'
import { projectFiles, projectTree, PROJECT_FOLDER } from './project-files'
import type { OpenFile } from './ide-types'

/**
 * The explorer, over what this community has actually built.
 *
 * It used to list three invented filenames read from a localStorage key
 * nothing writes, and opening one set `content: ''` -- so the editor was
 * always blank whatever you clicked.
 */
export function useFileTree() {
  const god = useAppSelector(s => s.god as GodState)
  const { tenant } = useCurrentTenantScope()
  const [openPath, setOpenPath] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set([PROJECT_FOLDER])
  )

  const files = useMemo(() => projectFiles(god, tenant), [god, tenant])
  const tree = useMemo(() => projectTree(files), [files])
  const openFile: OpenFile | null =
    openPath === null ? null : (files[openPath] ?? null)

  // The explorer hands over the language too; the file already knows it.
  const openFileNode = useCallback((path: string, _language?: string) => {
    setOpenPath(path)
  }, [])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  return { tree, openFile, expandedPaths, openFileNode, toggleExpand }
}
