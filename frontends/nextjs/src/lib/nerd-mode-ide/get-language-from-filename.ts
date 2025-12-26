const languageMap: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  html: 'html',
  css: 'css',
  scss: 'scss',
  lua: 'lua',
  py: 'python',
  md: 'markdown',
  cpp: 'cpp',
  h: 'cpp',
}

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  return languageMap[ext || ''] || 'plaintext'
}
