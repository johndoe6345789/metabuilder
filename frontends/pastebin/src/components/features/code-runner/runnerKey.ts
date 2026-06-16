import { appConfig } from '@/lib/config'

const languageRunnerMap: Record<string, string> =
  (appConfig as unknown as { languageRunnerMap: Record<string, string> })
    .languageRunnerMap ?? {}

const INTERACTIVE_RUNNER_KEYS = new Set(['python'])

/** Map a language label to its backend runner key (slug fallback). */
export function getRunnerKey(language: string): string {
  return (
    languageRunnerMap[language] ??
    language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  )
}

/** Whether the language's runner supports interactive stdin. */
export function isInteractiveRunner(language: string): boolean {
  return INTERACTIVE_RUNNER_KEYS.has(getRunnerKey(language))
}
