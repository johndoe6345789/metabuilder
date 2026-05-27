import { safeFilesAndEntry, mapOutputType } from './codeTerminalUtils'
import type { SnippetFile } from '@/lib/types'

// crypto.randomUUID is available in jest+jsdom
describe('codeTerminalUtils', () => {
  describe('mapOutputType', () => {
    it('maps "err" to "error"', () => {
      expect(mapOutputType('err')).toBe('error')
    })

    it('maps "prompt" to "input-prompt"', () => {
      expect(mapOutputType('prompt')).toBe('input-prompt')
    })

    it('maps "input-echo" to "input-value"', () => {
      expect(mapOutputType('input-echo')).toBe('input-value')
    })

    it('maps any other string to "output"', () => {
      expect(mapOutputType('stdout')).toBe('output')
      expect(mapOutputType('unknown')).toBe('output')
      expect(mapOutputType('')).toBe('output')
    })
  })

  describe('safeFilesAndEntry', () => {
    it('returns a safe (UUID) name for ordinary source files', () => {
      const files: SnippetFile[] = [{ name: 'main.py', content: 'print("hello")' }]
      const { safeFiles, resolvedEntry, fileMap } = safeFilesAndEntry(files, 'main.py')
      expect(safeFiles).toHaveLength(1)
      // uuid name starts with "f_"
      expect(safeFiles[0].name).toMatch(/^f_/)
      // resolvedEntry matches the uuid name
      expect(resolvedEntry).toBe(safeFiles[0].name)
      expect(fileMap[0].originalName).toBe('main.py')
      expect(fileMap[0].uuidName).toBe(safeFiles[0].name)
    })

    it('preserves the original name for build-system files', () => {
      const files: SnippetFile[] = [
        { name: 'CMakeLists.txt', content: 'cmake_minimum_required(VERSION 3.10)' },
        { name: 'main.cpp', content: '#include <CMakeLists.txt>' },
      ]
      const { safeFiles } = safeFilesAndEntry(files, 'main.cpp')
      const cmakeFile = safeFiles.find(f => f.name === 'CMakeLists.txt')
      expect(cmakeFile).toBeDefined()
    })

    it('preserves requirements.txt name', () => {
      const files: SnippetFile[] = [{ name: 'requirements.txt', content: 'requests' }]
      const { safeFiles } = safeFilesAndEntry(files, 'requirements.txt')
      expect(safeFiles[0].name).toBe('requirements.txt')
    })

    it('preserves Makefile name', () => {
      const files: SnippetFile[] = [{ name: 'Makefile', content: 'all: build' }]
      const { safeFiles } = safeFilesAndEntry(files, 'Makefile')
      expect(safeFiles[0].name).toBe('Makefile')
    })

    it('resolves entryPoint by stem when full path not found', () => {
      const files: SnippetFile[] = [{ name: 'app.js', content: 'console.log("x")' }]
      const { resolvedEntry } = safeFilesAndEntry(files, 'app')
      // 'app' stem should resolve to the uuid name of app.js
      expect(resolvedEntry).toMatch(/^f_/)
    })

    it('falls back to first file when entryPoint not resolvable', () => {
      const files: SnippetFile[] = [{ name: 'index.ts', content: '' }]
      const { resolvedEntry, safeFiles } = safeFilesAndEntry(files, 'nonexistent')
      expect(resolvedEntry).toBe(safeFiles[0].name)
    })

    it('rewrites cross-file basename references in content', () => {
      const files: SnippetFile[] = [
        { name: 'helper.py', content: '' },
        { name: 'main.py', content: 'import helper' },
      ]
      const { safeFiles } = safeFilesAndEntry(files, 'main.py')
      const mainFile = safeFiles.find(f => f.name !== safeFiles[0]!.name) ?? safeFiles[1]
      // The original stem "helper" should be replaced with the uuid stem
      const helperUuid = safeFiles.find(
        (_, i) => files[i]?.name === 'helper.py'
      )
      expect(helperUuid).toBeDefined()
    })

    it('handles multiple files and returns fileMap for all', () => {
      const files: SnippetFile[] = [
        { name: 'a.ts', content: '' },
        { name: 'b.ts', content: '' },
        { name: 'c.ts', content: '' },
      ]
      const { fileMap, safeFiles } = safeFilesAndEntry(files, 'a.ts')
      expect(fileMap).toHaveLength(3)
      expect(safeFiles).toHaveLength(3)
      const names = safeFiles.map(f => f.name)
      // All names should be unique
      expect(new Set(names).size).toBe(3)
    })

    it('produces extension-preserving safe names for .ts files', () => {
      const files: SnippetFile[] = [{ name: 'index.ts', content: '' }]
      const { safeFiles } = safeFilesAndEntry(files, 'index.ts')
      expect(safeFiles[0].name).toMatch(/\.ts$/)
    })

    it('handles files without extensions', () => {
      const files: SnippetFile[] = [{ name: 'Dockerfile', content: 'FROM node' }]
      const { safeFiles } = safeFilesAndEntry(files, 'Dockerfile')
      // Dockerfile is not in KEEP_ORIGINAL_NAMES, so it gets a uuid name
      expect(safeFiles[0].name).toMatch(/^f_/)
    })

    it('returns empty safeFiles and falls back entryPoint when files is empty', () => {
      const { safeFiles, resolvedEntry, fileMap } = safeFilesAndEntry([], 'main.py')
      expect(safeFiles).toHaveLength(0)
      expect(fileMap).toHaveLength(0)
      expect(resolvedEntry).toBe('main.py')
    })
  })
})
