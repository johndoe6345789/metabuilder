#!/usr/bin/env tsx

import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import JSZip from 'jszip'

import { generateCodegenZip } from '../frontends/nextjs/src/lib/codegen/generate-codegen-zip'

const spec = {
  projectName: 'neon-arcade-export',
  packageId: 'arcade_lobby',
  runtime: 'desktop',
  tone: 'neon',
  brief: 'Validates the Codegen Studio bundle outputs.',
}

const rootDir = spec.projectName.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
const outputDir = fileURLToPath(new URL('../.tmp', import.meta.url))
const outputFile = `${outputDir}/${spec.projectName}.zip`

const assertZipContains = async (zipBuffer: Buffer) => {
  const zip = await JSZip.loadAsync(zipBuffer)
  const paths = [
    `${rootDir}/README.md`,
    `${rootDir}/src/app/page.tsx`,
    `${rootDir}/cli/main.cpp`,
    `${rootDir}/spec.json`,
  ]

  for (const entry of paths) {
    if (!zip.file(entry)) {
      throw new Error(`Missing expected entry ${entry}`)
    }
  }
}

const run = async () => {
  await mkdir(outputDir, { recursive: true })
  const { zipBuffer } = await generateCodegenZip(spec)
  await assertZipContains(zipBuffer)
  await writeFile(outputFile, zipBuffer)
  console.log('Codegen export validated at', outputFile)
}

run().catch((error) => {
  console.error('Codegen export validation failed:', error)
  process.exit(1)
})
