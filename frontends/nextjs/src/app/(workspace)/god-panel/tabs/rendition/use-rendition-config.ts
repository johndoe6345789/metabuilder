'use client'

import { useCallback, useMemo, useState } from 'react'
import { snapshot } from '@/lib/persist/versions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearDirty,
  DEFAULT_RENDITION_CONFIG,
  setRendition,
  type RenditionConfig,
  type RenditionModule,
  type RenditionNavItem,
} from '@/store/slices/god-slice'

interface RenditionSliceState {
  god: {
    rendition?: RenditionConfig
    dirty?: { rendition?: boolean }
  }
}

function nid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function useRenditionConfig() {
  const dispatch = useAppDispatch()
  const rendition = useAppSelector(
    (state: unknown) =>
      (state as RenditionSliceState).god.rendition ?? DEFAULT_RENDITION_CONFIG
  )
  const dirty = useAppSelector(
    (state: unknown) =>
      (state as RenditionSliceState).god.dirty?.rendition ?? false
  )
  const [publishing, setPublishing] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const commit = useCallback(
    (next: RenditionConfig) => {
      dispatch(setRendition(next))
    },
    [dispatch]
  )

  const patch = useCallback(
    (patchValue: Partial<RenditionConfig>) => {
      commit({ ...rendition, ...patchValue })
    },
    [commit, rendition]
  )

  const patchModule = useCallback(
    (id: string, patchValue: Partial<RenditionModule>) => {
      commit({
        ...rendition,
        modules: rendition.modules.map(module =>
          module.id === id ? { ...module, ...patchValue } : module
        ),
      })
    },
    [commit, rendition]
  )

  const addModule = useCallback(() => {
    commit({
      ...rendition,
      modules: [
        ...rendition.modules,
        {
          id: nid('module'),
          label: 'New Module',
          description: 'Describe what this control panel module manages.',
          minLevel: 4,
          enabled: true,
          pinned: false,
        },
      ],
    })
  }, [commit, rendition])

  const removeModule = useCallback(
    (id: string) => {
      commit({
        ...rendition,
        modules: rendition.modules.filter(module => module.id !== id),
      })
    },
    [commit, rendition]
  )

  const patchNavItem = useCallback(
    (id: string, patchValue: Partial<RenditionNavItem>) => {
      commit({
        ...rendition,
        navItems: rendition.navItems.map(item =>
          item.id === id ? { ...item, ...patchValue } : item
        ),
      })
    },
    [commit, rendition]
  )

  const addNavItem = useCallback(() => {
    commit({
      ...rendition,
      navItems: [
        ...rendition.navItems,
        {
          id: nid('nav'),
          label: 'New Link',
          path: '/',
          minLevel: 1,
          enabled: true,
        },
      ],
    })
  }, [commit, rendition])

  const removeNavItem = useCallback(
    (id: string) => {
      commit({
        ...rendition,
        navItems: rendition.navItems.filter(item => item.id !== id),
      })
    },
    [commit, rendition]
  )

  const manifest = useMemo(
    () => ({
      kind: 'metabuilder-rendition',
      version: 1,
      rendition,
      generatedAt: new Date().toISOString(),
    }),
    [rendition]
  )

  const downloadManifest = useCallback(() => {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${rendition.tenantId}-metabuilder-rendition.json`
    link.click()
    URL.revokeObjectURL(url)
    setFlash('Rendition manifest downloaded.')
  }, [manifest, rendition.tenantId])

  const publish = useCallback(async () => {
    setPublishing(true)
    try {
      await snapshot('god.rendition', rendition, 'Published rendition')
      dispatch(clearDirty('rendition'))
      setFlash('Rendition published to local version history.')
    } finally {
      setPublishing(false)
    }
  }, [dispatch, rendition])

  return {
    rendition,
    dirty,
    publishing,
    flash,
    manifest,
    patch,
    patchModule,
    addModule,
    removeModule,
    patchNavItem,
    addNavItem,
    removeNavItem,
    publish,
    downloadManifest,
    clearFlash: () => {
      setFlash(null)
    },
  }
}

export type RenditionConfigController = ReturnType<typeof useRenditionConfig>
