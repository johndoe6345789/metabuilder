export function convertMethodToFunction(methodText: string, isAsync: boolean): string {
  let funcText = methodText.replace(/^\s*(public|private|protected)\s+/, '')

  if (isAsync && !funcText.trim().startsWith('async')) {
    funcText = 'async ' + funcText
  }

  funcText = funcText.replace(/^(\s*)(async\s+)?([a-zA-Z0-9_]+)(\s*\([^)]*\))/, '$1$2function $3$4')

  return funcText
}
