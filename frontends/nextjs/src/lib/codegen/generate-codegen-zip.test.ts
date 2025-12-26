import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import { generateCodegenZip } from './generate-codegen-zip'

describe('generateCodegenZip', () => {
  it('packages runtime-specific files into the archive', async () => {
    const spec = {
      projectName: 'Neon Arcade',
      packageId: 'arcade_lobby',
      runtime: 'desktop',
      tone: 'neon',
      brief: 'Desktop lobby for curated tournaments',
    }

    const { zipBuffer, fileName } = await generateCodegenZip(spec)
    expect(fileName).toContain('codegen-neon-arcade')

    const zip = await JSZip.loadAsync(zipBuffer)
    expect(zip.file('neon-arcade/spec.json')).toBeDefined()
    expect(zip.file('neon-arcade/src/app/page.tsx')).toBeDefined()
    expect(zip.file('neon-arcade/cli/main.cpp')).toBeDefined()
  })
})
