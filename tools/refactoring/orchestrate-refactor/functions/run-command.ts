import { ASTLambdaRefactor } from './ast-lambda-refactor'
import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

export async function runCommand(cmd: string, cwd: string = process.cwd()): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(cmd, { cwd, maxBuffer: 10 * 1024 * 1024 })
  } catch (error: any) {
    return { stdout: error.stdout || '', stderr: error.stderr || error.message }
  }
}
