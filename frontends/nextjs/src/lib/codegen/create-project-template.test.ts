import { describe, expect, it } from 'vitest'

import { createProjectTemplate } from './create-project-template'

describe('createProjectTemplate', () => {
  it('builds a manifest and includes Next.js + CLI assets', () => {
    const spec = {
      projectName: 'Meta Builder Lab',
      packageId: 'codegen_studio',
      runtime: 'hybrid',
      tone: 'futuristic',
      brief: 'Generates modern starter zips',
    }

    const template = createProjectTemplate(spec)

    expect(template.manifest.packageId).toBe('codegen_studio')
    expect(template.zipName).toContain('codegen-meta-builder-lab')

    const paths = template.files.map(file => file.path)
    expect(paths).toEqual(
      expect.arrayContaining([
        'meta-builder-lab/README.md',
        'meta-builder-lab/package.json',
        'meta-builder-lab/src/app/page.tsx',
        'meta-builder-lab/cli/main.cpp',
        'meta-builder-lab/spec.json',
      ])
    )
  })
})
