import type { FileEntry, FileNode } from './types'

const splitExportPath = (exportPath: string): string[] => {
  return exportPath.split('/').filter(Boolean)
}

export function collectFileEntries(nodes: FileNode[]): FileEntry[] {
  const entries: FileEntry[] = []

  const walk = (node: FileNode, rootSegments: string[], exportSegments: string[]): void => {
    const nextExportSegments = node.exportPath
      ? [...rootSegments, ...splitExportPath(node.exportPath)]
      : [...exportSegments, node.name]

    if (node.type === 'file') {
      entries.push({ path: nextExportSegments.join('/'), content: node.content ?? '' })
      return
    }

    if (node.children) {
      node.children.forEach((child) => walk(child, rootSegments, nextExportSegments))
    }
  }

  nodes.forEach((node) => {
    const rootSegments = [node.name]
    if (node.type === 'file') {
      entries.push({ path: rootSegments.join('/'), content: node.content ?? '' })
      return
    }
    node.children?.forEach((child) => walk(child, rootSegments, rootSegments))
  })

  return entries
}
