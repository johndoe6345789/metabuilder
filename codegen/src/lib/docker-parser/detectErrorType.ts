export function detectErrorType(errorLine: string, fullLog: string): string {
  const lowerError = errorLine.toLowerCase()
  const lowerLog = fullLog.toLowerCase()

  if (lowerError.includes('cannot find module') || lowerError.includes('module_not_found')) {
    return 'Missing Dependency'
  }

  if (lowerError.includes('enoent') || lowerError.includes('no such file')) {
    return 'File Not Found'
  }

  if (lowerLog.includes('arm64') || lowerLog.includes('amd64') || lowerError.includes('platform')) {
    return 'Platform/Architecture Issue'
  }

  if (lowerError.includes('permission denied') || lowerError.includes('eacces')) {
    return 'Permission Error'
  }

  if (lowerError.includes('network') || lowerError.includes('timeout') || lowerError.includes('connection')) {
    return 'Network Error'
  }

  if (lowerError.includes('syntax') || lowerError.includes('unexpected')) {
    return 'Syntax Error'
  }

  if (lowerError.includes('memory') || lowerError.includes('out of')) {
    return 'Resource Limit'
  }

  return 'Build Failure'
}
