import { useCallback } from 'react'
import { toast } from '@metabuilder/components/m3'
import { createSnippet } from '@/lib/db'
import type { Snippet } from '@/lib/types'

export function useSaveSnippet() {
  return useCallback(
    async (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newSnippet: Snippet = {
          ...snippetData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        await createSnippet(newSnippet)
        toast.success('Component saved as snippet!')
      } catch (error) {
        console.error('Failed to save snippet:', error)
        toast.error('Failed to save snippet')
      }
    },
    [],
  )
}
