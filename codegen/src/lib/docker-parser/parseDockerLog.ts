import { DockerError } from '@/types/docker'
import { detectErrorType } from './detectErrorType'

export function parseDockerLog(log: string): DockerError[] {
  const errors: DockerError[] = []
  const lines = log.split('\n')

  let currentError: Partial<DockerError> | null = null
  let contextLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.includes('ERROR:') || line.includes('Error:')) {
      if (currentError) {
        errors.push({
          id: Math.random().toString(36).substr(2, 9),
          type: currentError.type || 'Unknown Error',
          message: currentError.message || 'An error occurred',
          stage: currentError.stage,
          exitCode: currentError.exitCode,
          context: contextLines.slice(-5),
          severity: 'critical'
        })
      }

      currentError = {
        message: line.replace(/^.*?ERROR:\s*/, '').replace(/^.*?Error:\s*/, '').trim()
      }
      contextLines = [line]

      const stageMatch = log.match(/\[([^\]]+)\s+\d+\/\d+\]/)
      if (stageMatch) {
        currentError.stage = stageMatch[1]
      }

      const exitCodeMatch = line.match(/exit code[:\s]+(\d+)/i)
      if (exitCodeMatch) {
        currentError.exitCode = parseInt(exitCodeMatch[1], 10)
      }

      currentError.type = detectErrorType(line, log)
    } else if (currentError) {
      contextLines.push(line)
    }
  }

  if (currentError) {
    errors.push({
      id: Math.random().toString(36).substr(2, 9),
      type: currentError.type || 'Unknown Error',
      message: currentError.message || 'An error occurred',
      stage: currentError.stage,
      exitCode: currentError.exitCode,
      context: contextLines.slice(-5),
      severity: 'critical'
    })
  }

  return errors
}
