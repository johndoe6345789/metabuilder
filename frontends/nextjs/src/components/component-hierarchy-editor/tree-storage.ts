import type { ComponentNode } from './types'

export function storageKey(page: string): string {
  return `component-tree-${page}`
}

export function loadNodes(page: string): ComponentNode[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(page))
    if (raw == null) return []
    return JSON.parse(raw) as ComponentNode[]
  } catch {
    return []
  }
}

export function saveNodes(page: string, nodes: ComponentNode[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(page), JSON.stringify(nodes))
}
