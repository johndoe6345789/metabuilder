import { describe, expect, it } from 'vitest'

import { collectFileEntries } from './collect-file-entries'
import type { FileNode } from './types'

describe('collectFileEntries', () => {
  it('respects exportPath overrides while keeping root folder names', () => {
    const tree: FileNode[] = [
      {
        id: 'root',
        name: 'social_hub',
        type: 'folder',
        children: [
          {
            id: 'lua',
            name: 'Lua',
            type: 'folder',
            exportPath: 'seed/scripts',
            children: [
              {
                id: 'manifest',
                name: 'manifest.json',
                type: 'file',
                content: '{"scripts":[]}',
              },
            ],
          },
          {
            id: 'metadata',
            name: 'metadata',
            type: 'folder',
            exportPath: 'seed',
            children: [
              {
                id: 'meta-file',
                name: 'metadata.json',
                type: 'file',
                content: '{"packageId":"social_hub"}',
              },
            ],
          },
        ],
      },
    ]

    const entries = collectFileEntries(tree)
    const paths = entries.map(entry => entry.path)

    expect(paths).toContain('social_hub/seed/scripts/manifest.json')
    expect(paths).toContain('social_hub/seed/metadata.json')
  })
})
