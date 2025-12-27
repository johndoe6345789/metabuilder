export interface FunctionDef {
  name: string
  file: string
  type: 'named' | 'default' | 'class-method'
  line: number
}

export const extractFunctions = (content: string, file: string): FunctionDef[] => {
  const functions: FunctionDef[] = []
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    const lineNum = index + 1

    const namedFuncMatch = line.match(/export\s+(?:function|const)\s+(\w+)\s*(?:\(|=)/)
    if (namedFuncMatch) {
      functions.push({
        name: namedFuncMatch[1],
        file,
        type: 'named',
        line: lineNum
      })
    }

    const classMethodMatch = line.match(/^\s+(\w+)\s*\(.*\)\s*[:{]/)
    if (classMethodMatch && line.includes('class')) {
      functions.push({
        name: classMethodMatch[1],
        file,
        type: 'class-method',
        line: lineNum
      })
    }

    if (line.includes('export default') && line.includes('function')) {
      const defaultMatch = line.match(/export\s+default\s+function\s+(\w+)/)
      if (defaultMatch) {
        functions.push({
          name: defaultMatch[1],
          file,
          type: 'default',
          line: lineNum
        })
      }
    }
  })

  return functions
}
