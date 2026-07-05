'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Workflow } from '@/workflow-editor'

const STORAGE_KEY = 'metabuilder.god.workflow'

function seed(): Workflow {
  const now = new Date().toISOString()
  return {
    id: 'wf_god_default',
    name: 'Untitled Workflow',
    description: '',
    nodes: [],
    connections: [],
    createdAt: now,
    updatedAt: now,
  }
}

/** Holds the god-panel's current workflow, persisted to localStorage. */
export function useGodWorkflow() {
  const [workflow, setWorkflow] = useState<Workflow>(seed)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setWorkflow(JSON.parse(raw) as Workflow)
    } catch { /* keep seed */ }
  }, [])

  const save = useCallback((wf: Workflow) => {
    setWorkflow(wf)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wf)) } catch { /* ignore */ }
  }, [])

  return { workflow, save }
}
