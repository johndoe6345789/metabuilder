/** Map display language names to debug-runner keys (backend _DEBUG_RUNNERS). */
export const LANG_KEY: Record<string, string> = {
  Python: 'python',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Go: 'go',
  'C++': 'cpp-cmake',
}

/** Languages the debugger supports, in display form. */
export const SUPPORTED_LANGUAGES = Object.keys(LANG_KEY)

/** Resolve a display language to its runner key (slugified fallback). */
export function runnerKeyFor(language: string): string {
  return (
    LANG_KEY[language] ?? language.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  )
}
