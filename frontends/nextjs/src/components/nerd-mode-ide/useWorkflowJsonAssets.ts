'use client'

import { useState, useCallback } from 'react'
import type { WorkflowJsonAsset } from './ide-types'

const DEFAULT_CODE = `{
  "id": "workflow_new",
  "name": "New workflow",
  "nodes": [
    {
      "id": "trigger",
      "type": "manual.trigger",
      "name": "Manual Trigger",
      "parameters": {}
    }
  ],
  "connections": {}
}
`
const STORAGE_KEY = 'workflow-json-assets'

function loadAssets(): WorkflowJsonAsset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw != null) return JSON.parse(raw) as WorkflowJsonAsset[]
  } catch { /* ignore */ }
  return []
}

export function saveWorkflowJsonAssets(assets: WorkflowJsonAsset[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  }
}

export function useWorkflowJsonAssets() {
  const [assets, setAssets] = useState<WorkflowJsonAsset[]>(loadAssets)
  const [selectedId, setSelectedId] = useState<string | null>(() => loadAssets()[0]?.id ?? null)

  const addAsset = useCallback(() => {
    const entry: WorkflowJsonAsset = {
      id: `workflow_json_${Date.now()}`,
      name: 'new-workflow.json',
      code: DEFAULT_CODE,
    }
    setAssets((prev) => {
      const next = [...prev, entry]
      saveWorkflowJsonAssets(next)
      return next
    })
    setSelectedId(entry.id)
  }, [])

  const updateName = useCallback(
    (name: string, id: string | null) => {
      if (id == null) return
      setAssets((prev) =>
        prev.map((sc) => (sc.id === id ? { ...sc, name } : sc))
      )
    },
    []
  )

  const selected = assets.find((sc) => sc.id === selectedId) ?? null

  return {
    assets,
    selectedId,
    selected,
    setSelectedId,
    addAsset,
    updateName,
    save: () => { saveWorkflowJsonAssets(assets) },
  }
}
