import type { Assembly, Materials, Part } from './types'

const cache = new Map<string, unknown>()

async function fetchJSON<T>(path: string): Promise<T> {
  if (cache.has(path)) {
    return cache.get(path) as T
  }

  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`)
  }

  const data = await response.json()
  cache.set(path, data)
  return data
}

export async function loadMaterials(): Promise<Materials> {
  return fetchJSON<Materials>('/packages/materials.json')
}

export async function loadAssembly(
  category: string,
  manufacturer: string,
  product: string,
  assembly: string
): Promise<Assembly> {
  const basePath = `/packages/${category}/${manufacturer}/${product}/${assembly}`

  // Load assembly manifest
  const manifest = await fetchJSON<{ name: string; description?: string; category?: string; parts: string[] }>(
    `${basePath}/assembly.json`
  )

  // Load each part
  const parts = await Promise.all(
    manifest.parts.map(partRef =>
      fetchJSON<Part>(`${basePath}/parts/${partRef}.json`)
    )
  )

  return {
    ...manifest,
    parts
  }
}
