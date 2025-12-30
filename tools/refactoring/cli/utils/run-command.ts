import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function runCommand(cmd: string, cwd: string = process.cwd()): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(cmd, { cwd, maxBuffer: 10 * 1024 * 1024 })
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; message?: string }
    return { stdout: execError.stdout || '', stderr: execError.stderr || execError.message || '' }
  }
}
