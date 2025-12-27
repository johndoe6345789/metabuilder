interface MinimalFunctionInfo {
  name: string
}

export function buildIndexContent(functions: MinimalFunctionInfo[], functionsDir: string, className?: string): string {
  let content = ''

  content += `// Auto-generated re-exports for backward compatibility\n\n`

  for (const func of functions) {
    const kebabName = func.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
    content += `export { ${func.name} } from './${functionsDir}/${kebabName}'\n`
  }

  if (className) {
    content += `\n// Class wrapper for convenience\n`
    content += `export { ${className} } from './${className}'\n`
  }

  return content
}
