/**
 * useComponentTreeViewer
 *
 * Stateful logic for ComponentTreeViewer — tab
 * selection and tree selection, with toast feedback
 * on reload.
 */

import { useState } from 'react'
import {
  useComponentTreeLoader,
} from '@/hooks/use-component-tree-loader'
import { toast } from '@/components/ui/sonner'
import componentTreeCopy from '@/data/component-tree-viewer.json'

export function useComponentTreeViewer() {
  const {
    isLoaded,
    isLoading,
    error,
    moleculeTrees,
    organismTrees,
    allTrees,
    reloadFromJSON,
  } = useComponentTreeLoader()

  const [selectedTreeId, setSelectedTreeId] =
    useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  const handleReload = async () => {
    try {
      await reloadFromJSON()
      toast.success(componentTreeCopy.toast.reloadSuccess)
    } catch {
      toast.error(componentTreeCopy.toast.reloadError)
    }
  }

  const selectedTree = allTrees.find(
    (tree) => tree.id === selectedTreeId
  )

  return {
    isLoaded,
    isLoading,
    error,
    moleculeTrees,
    organismTrees,
    allTrees,
    selectedTreeId,
    setSelectedTreeId,
    activeTab,
    setActiveTab,
    handleReload,
    selectedTree,
  }
}
