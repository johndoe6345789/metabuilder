import type { Monaco } from '@monaco-editor/react'

/**
 * Configure TypeScript support in Monaco Editor
 */
export function configureMonacoTypeScript(monaco: Monaco) {
  // TypeScript is automatically supported by Monaco
  // This function can be used for additional configuration if needed
  if (monaco.languages.typescript) {
    // Configure TypeScript defaults if needed
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
  }
}

/**
 * Map language names to Monaco Editor language IDs
 */
export function getMonacoLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'JSX': 'javascript',
    'TSX': 'typescript',
    'Python': 'python',
    'Java': 'java',
    'C++': 'cpp',
    'C#': 'csharp',
    'Go': 'go',
    'Rust': 'rust',
    'PHP': 'php',
    'Ruby': 'ruby',
    'SQL': 'sql',
    'HTML': 'html',
    'CSS': 'css',
    'JSON': 'json',
    'YAML': 'yaml',
    'Markdown': 'markdown',
    'XML': 'xml',
    'Shell': 'shell',
    'Bash': 'shell',
  }

  return languageMap[language] || language.toLowerCase()
}
