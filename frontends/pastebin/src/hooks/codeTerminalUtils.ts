import type { SnippetFile } from '@/lib/types'
import type { RunFileMap } from './useCodeTerminal'

const KEEP_ORIGINAL_NAMES = new Set([
  'CMakeLists.txt', 'Makefile', 'makefile', 'GNUmakefile',
  'requirements.txt', 'requirements-dev.txt',
  'package.json', 'package-lock.json',
  'go.mod', 'go.sum',
  'Cargo.toml', 'Cargo.lock',
  'pom.xml',
  'build.gradle', 'build.gradle.kts', 'settings.gradle',
  'Gemfile', 'Gemfile.lock',
  'Project.toml', 'Manifest.toml',
])

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function safeFilesAndEntry(
  files: SnippetFile[],
  entryPoint: string,
): {
  safeFiles: SnippetFile[]
  resolvedEntry: string
  fileMap: RunFileMap[]
} {
  const nameMap = new Map<string, string>()
  const stemMap = new Map<string, string>()
  const rawFiles: Array<{ name: string; content: string }> = []
  const fileMap: RunFileMap[] = []

  for (const f of files) {
    const basename = f.name.split('/').pop() ?? f.name
    const dotIdx = basename.lastIndexOf('.')
    const origStem = dotIdx >= 0 ? basename.slice(0, dotIdx) : basename
    const ext = dotIdx >= 0 ? basename.slice(dotIdx).toLowerCase().replace(/[^a-z0-9.]/g, '') : ''

    const safeName = KEEP_ORIGINAL_NAMES.has(basename)
      ? basename
      : 'f_' + crypto.randomUUID().replace(/-/g, '') + ext

    nameMap.set(f.name, safeName)
    if (!stemMap.has(origStem)) stemMap.set(origStem, safeName)
    rawFiles.push({ name: safeName, content: f.content })
    fileMap.push({ originalName: f.name, uuidName: safeName })
  }

  const safeFiles: SnippetFile[] = rawFiles.map(rf => {
    let content = rf.content
    for (const [origPath, safeName] of nameMap.entries()) {
      if (origPath === safeName) continue
      const origBasename = origPath.split('/').pop() ?? origPath
      const dotIdx = origBasename.lastIndexOf('.')
      const origStem = dotIdx >= 0 ? origBasename.slice(0, dotIdx) : origBasename
      const safeStem = dotIdx >= 0 ? safeName.slice(0, safeName.lastIndexOf('.')) : safeName

      content = content.split(origBasename).join(safeName)

      if (
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(origStem) &&
        origStem !== origBasename
      ) {
        content = content.replace(
          new RegExp(`\\b${escapeRegex(origStem)}\\b`, 'g'),
          safeStem,
        )
      }
    }
    return { name: rf.name, content }
  })

  let resolvedEntry: string
  if (nameMap.has(entryPoint)) {
    resolvedEntry = nameMap.get(entryPoint)!
  } else if (stemMap.has(entryPoint)) {
    resolvedEntry = stemMap.get(entryPoint)!
  } else {
    resolvedEntry = safeFiles[0]?.name ?? entryPoint
  }

  return { safeFiles, resolvedEntry, fileMap }
}

export function mapOutputType(
  backendType: string,
): 'output' | 'error' | 'input-prompt' | 'input-value' {
  switch (backendType) {
    case 'err': return 'error'
    case 'prompt': return 'input-prompt'
    case 'input-echo': return 'input-value'
    default: return 'output'
  }
}
