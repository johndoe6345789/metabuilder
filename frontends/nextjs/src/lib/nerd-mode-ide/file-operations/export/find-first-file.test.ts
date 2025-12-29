import { describe, expect,it } from 'vitest'

import { findFirstFile } from './find-first-file'
import type { FileNode } from './types'

describe('findFirstFile', () => {
  it('returns the first file in depth-first order', () => {
    const tree: FileNode[] = [
      {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [
          {
            id: 'child-folder',
            name: 'child',
            type: 'folder',
            children: [
              {
                id: 'nested-file',
                name: 'nested.txt',
                type: 'file',
                content: 'nested',
              },
            ],
          },
          {
            id: 'root-file',
            name: 'root.txt',
            type: 'file',
            content: 'root',
          },
        ],
      },
    ]

    const found = findFirstFile(tree)
    expect(found?.id).toBe('nested-file')
  })

  it('returns null when there are no files', () => {
    const tree: FileNode[] = [{ id: 'folder', name: 'folder', type: 'folder', children: [] }]

    expect(findFirstFile(tree)).toBeNull()
  })
})
