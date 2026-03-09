import { useState, useRef } from 'react'
import {
  runCodeViaFlask,
  startInteractiveSession,
  pollSession,
  sendSessionInput,
} from '@/lib/flask-runner'
import { type SnippetFile } from '@/lib/types'
import { appConfig } from '@/lib/config'

// Map from display language name to backend runner key
const languageRunnerMap: Record<string, string> = (appConfig as unknown as { languageRunnerMap: Record<string, string> }).languageRunnerMap ?? {}

function getRunnerKey(language: string): string {
  return languageRunnerMap[language] ?? language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// Languages that support interactive stdin (input() polling) — by runner key
const INTERACTIVE_RUNNER_KEYS = new Set(['python'])

export interface TerminalLine {
  type: 'output' | 'error' | 'input-prompt' | 'input-value'
  content: string
  id: string
}

export interface RunFileMap {
  originalName: string
  uuidName: string
}

export interface RunDebugInfo {
  language: string
  runnerKey: string
  interactive: boolean
  files: RunFileMap[]
  entryPointOriginal: string
  entryPointSent: string
  startedAt: number
}

/**
 * Files that build/package tools require by exact name.
 * These keep their original names so tooling still finds them.
 * Cross-references inside them are still rewritten to UUID names.
 */
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

/**
 * Assign UUID names to source files, keep build/config files under their
 * original names, then rewrite cross-references throughout all file contents.
 *
 * UUID names use an `f_` prefix so stems are valid identifiers in Python/JS/Go.
 * Exact filename and word-boundary stem replacements are both performed.
 */
function safeFilesAndEntry(
  files: SnippetFile[],
  entryPoint: string,
): { safeFiles: SnippetFile[]; resolvedEntry: string; fileMap: RunFileMap[] } {
  // ── Phase 1: assign names ────────────────────────────────────────────────
  const nameMap = new Map<string, string>()  // original path → safe name
  const stemMap = new Map<string, string>()  // original stem → safe name
  const rawFiles: Array<{ name: string; content: string }> = []
  const fileMap: RunFileMap[] = []

  for (const f of files) {
    const basename = f.name.split('/').pop() ?? f.name
    const dotIdx = basename.lastIndexOf('.')
    const origStem = dotIdx >= 0 ? basename.slice(0, dotIdx) : basename
    const ext = dotIdx >= 0 ? basename.slice(dotIdx).toLowerCase().replace(/[^a-z0-9.]/g, '') : ''

    let safeName: string
    if (KEEP_ORIGINAL_NAMES.has(basename)) {
      safeName = basename  // tool config — keep exact name
    } else {
      // f_ prefix guarantees a valid identifier stem for Python/JS/Go imports
      safeName = 'f_' + crypto.randomUUID().replace(/-/g, '') + ext
    }

    nameMap.set(f.name, safeName)
    if (!stemMap.has(origStem)) stemMap.set(origStem, safeName)
    rawFiles.push({ name: safeName, content: f.content })
    fileMap.push({ originalName: f.name, uuidName: safeName })
  }

  // ── Phase 2: rewrite cross-references in all file contents ───────────────
  const safeFiles: SnippetFile[] = rawFiles.map(rf => {
    let content = rf.content
    for (const [origPath, safeName] of nameMap.entries()) {
      if (origPath === safeName) continue  // name unchanged — nothing to replace
      const origBasename = origPath.split('/').pop() ?? origPath
      const dotIdx = origBasename.lastIndexOf('.')
      const origStem = dotIdx >= 0 ? origBasename.slice(0, dotIdx) : origBasename
      const safeStem = dotIdx >= 0 ? safeName.slice(0, safeName.lastIndexOf('.')) : safeName

      // Exact filename (covers open('file.py'), require('./file.py'), CMakeLists refs)
      content = content.split(origBasename).join(safeName)

      // Stem replacement for imports — only for valid identifier stems
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(origStem) && origStem !== origBasename) {
        content = content.replace(new RegExp(`\\b${escapeRegex(origStem)}\\b`, 'g'), safeStem)
      }
    }
    return { name: rf.name, content }
  })

  // ── Phase 3: resolve entry point ────────────────────────────────────────
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

function mapType(backendType: string): TerminalLine['type'] {
  switch (backendType) {
    case 'err':         return 'error'
    case 'prompt':      return 'input-prompt'
    case 'input-echo':  return 'input-value'
    default:            return 'output'
  }
}

const POLL_INTERVAL_MS = 150

export type UseCodeTerminalReturn = ReturnType<typeof useCodeTerminal>

export function useCodeTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [lastRunInfo, setLastRunInfo] = useState<RunDebugInfo | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  const offsetRef = useRef(0)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function addLine(type: TerminalLine['type'], content: string) {
    setLines((prev) => [...prev, { type, content, id: `${Date.now()}-${Math.random()}` }])
  }

  function stopPolling() {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  async function poll() {
    const sid = sessionIdRef.current
    if (!sid) return

    try {
      const result = await pollSession(sid, offsetRef.current)
      offsetRef.current += result.output.length

      for (const line of result.output) {
        addLine(mapType(line.type), line.text)
      }

      setWaitingForInput(result.waiting_for_input)

      if (result.done) {
        setIsRunning(false)
        stopPolling()
        return
      }
    } catch {
      // transient network error — keep polling
    }

    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
  }

  const handleRun = async (language: string, files: SnippetFile[], entryPoint?: string) => {
    stopPolling()
    setLines([])
    setWaitingForInput(false)
    setInputValue('')
    offsetRef.current = 0
    sessionIdRef.current = null
    setIsRunning(true)

    const runnerKey = getRunnerKey(language)
    const isInteractive = INTERACTIVE_RUNNER_KEYS.has(runnerKey)
    const { safeFiles, resolvedEntry, fileMap } = safeFilesAndEntry(files, entryPoint ?? '')
    const opts = { language: runnerKey, files: safeFiles, entryPoint: resolvedEntry }

    setLastRunInfo({
      language,
      runnerKey,
      interactive: isInteractive,
      files: fileMap,
      entryPointOriginal: entryPoint ?? '',
      entryPointSent: resolvedEntry,
      startedAt: Date.now(),
    })

    try {
      if (isInteractive) {
        const sid = await startInteractiveSession(opts)
        sessionIdRef.current = sid
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
      } else {
        const result = await runCodeViaFlask(opts)
        if (result.output) addLine('output', result.output)
        if (result.error) addLine('error', result.error)
        setIsRunning(false)
      }
    } catch (err) {
      addLine('error', err instanceof Error ? err.message : String(err))
      setIsRunning(false)
    }
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sid = sessionIdRef.current
    if (!waitingForInput || !sid) return

    const value = inputValue
    setInputValue('')
    setWaitingForInput(false)

    try {
      await sendSessionInput(sid, value)
    } catch (err) {
      addLine('error', err instanceof Error ? err.message : String(err))
    }
  }

  const handleStop = () => {
    stopPolling()
    sessionIdRef.current = null
    setIsRunning(false)
    setWaitingForInput(false)
    addLine('error', '[stopped]')
  }

  return {
    lines,
    isRunning,
    isInitializing: false,
    inputValue,
    waitingForInput,
    lastRunInfo,
    setInputValue,
    handleInputSubmit,
    handleRun,
    handleStop,
  }
}
