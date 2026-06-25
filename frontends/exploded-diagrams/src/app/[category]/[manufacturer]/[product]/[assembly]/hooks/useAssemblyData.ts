'use client'

import { useEffect, useState } from 'react'
import { loadAssembly, loadMaterials } from '@/lib/loader'
import type { Assembly, Materials } from '@/lib/types'

interface Params {
  category: string
  manufacturer: string
  product: string
  assembly: string
}

export function useAssemblyData({
  category,
  manufacturer,
  product,
  assembly,
}: Params) {
  const [data, setData] = useState<Assembly | null>(null)
  const [materials, setMaterials] = useState<Materials>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [assemblyData, materialsData] = await Promise.all([
          loadAssembly(category, manufacturer, product, assembly),
          loadMaterials(),
        ])
        setData(assemblyData)
        setMaterials(materialsData)
        setLoading(false)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load assembly'
        )
        setLoading(false)
      }
    }
    load()
  }, [category, manufacturer, product, assembly])

  return { data, materials, loading, error }
}
