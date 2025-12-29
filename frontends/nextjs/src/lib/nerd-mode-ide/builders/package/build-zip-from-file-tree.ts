import JSZip from 'jszip'

import { collectFileEntries } from '../../file-operations/tree/collect-file-entries'
import type { FileNode } from './types'

export async function buildZipFromFileTree(nodes: FileNode[]): Promise<Blob> {
  const zip = new JSZip()
  const entries = collectFileEntries(nodes)

  entries.forEach(entry => {
    zip.file(entry.path, entry.content)
  })

  return zip.generateAsync({ type: 'blob' })
}
