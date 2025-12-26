import { createNodeId } from './create-node-id'
import { getLanguageFromFilename } from './get-language-from-filename'
import type { FileNode } from './types'

interface CreateFileNodeOptions {
  name: string
  content?: string
  exportPath?: string
}

export function createFileNode({ name, content = '', exportPath }: CreateFileNodeOptions): FileNode {
  return {
    id: createNodeId('file'),
    name,
    type: 'file',
    content,
    language: getLanguageFromFilename(name),
    exportPath,
  }
}
