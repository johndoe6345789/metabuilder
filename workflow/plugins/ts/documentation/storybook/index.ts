/**
 * Storybook Workflow Plugin
 * Generate and manage component documentation as workflow nodes
 * @packageDocumentation
 */

import { spawn } from 'child_process'
import * as path from 'path'

export interface StorybookBuildInput {
  command?: 'dev' | 'build' | 'test'
  port?: number
  outputDir?: string
  configDir?: string
  staticDir?: string
  docs?: boolean
}

export interface StorybookBuildResult {
  status: 'success' | 'failed'
  duration: number
  output: string[]
  errors?: string[]
  outputPath?: string
  port?: number
}

export class StorybookNode {
  private process: any = null

  async execute(input: StorybookBuildInput): Promise<StorybookBuildResult> {
    const startTime = Date.now()
    const command = input.command || 'build'
    const output: string[] = []
    const errors: string[] = []

    try {
      // Build storybook args
      const args = this.buildArgs(input)

      // Execute storybook command
      const result = await this.runCommand('storybook', [command, ...args])

      output.push(...result.output)
      errors.push(...result.errors)

      return {
        status: result.success ? 'success' : 'failed',
        duration: Date.now() - startTime,
        output,
        errors: errors.length > 0 ? errors : undefined,
        outputPath: input.outputDir || 'storybook-static',
        port: command === 'dev' ? (input.port || 6006) : undefined
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(err.message)

      return {
        status: 'failed',
        duration: Date.now() - startTime,
        output,
        errors
      }
    }
  }

  private buildArgs(input: StorybookBuildInput): string[] {
    const args: string[] = []

    if (input.port && input.command === 'dev') {
      args.push('-p', String(input.port))
    }

    if (input.outputDir) {
      args.push('-o', input.outputDir)
    }

    if (input.configDir) {
      args.push('-c', input.configDir)
    }

    if (input.staticDir) {
      args.push('-s', input.staticDir)
    }

    if (input.docs) {
      args.push('--docs')
    }

    return args
  }

  private runCommand(
    command: string,
    args: string[]
  ): Promise<{ success: boolean; output: string[]; errors: string[] }> {
    return new Promise((resolve) => {
      const output: string[] = []
      const errors: string[] = []

      const proc = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      proc.stdout.on('data', (data: any) => {
        output.push(data.toString())
      })

      proc.stderr.on('data', (data: any) => {
        errors.push(data.toString())
      })

      proc.on('close', (code: number) => {
        resolve({
          success: code === 0,
          output,
          errors
        })
      })

      proc.on('error', (error: Error) => {
        errors.push(error.message)
        resolve({
          success: false,
          output,
          errors
        })
      })
    })
  }
}

/**
 * Workflow node factory
 */
export async function createStorybookNode(config: any) {
  return new StorybookNode()
}

/**
 * Node type definition
 */
export const nodeDefinition = {
  displayName: 'Storybook',
  description: 'Generate or serve Storybook documentation',
  icon: 'book',
  group: ['documentation'],
  version: 1,
  subtitle: 'Component documentation',
  inputs: [
    {
      name: 'main',
      type: 'main'
    }
  ],
  outputs: [
    {
      name: 'main',
      type: 'main'
    }
  ],
  properties: [
    {
      displayName: 'Command',
      name: 'command',
      type: 'options',
      default: 'build',
      options: [
        {
          name: 'Build (static)',
          value: 'build'
        },
        {
          name: 'Dev server',
          value: 'dev'
        },
        {
          name: 'Test',
          value: 'test'
        }
      ]
    },
    {
      displayName: 'Port',
      name: 'port',
      type: 'number',
      default: 6006,
      displayOptions: {
        show: {
          command: ['dev']
        }
      }
    },
    {
      displayName: 'Output Directory',
      name: 'outputDir',
      type: 'string',
      default: 'storybook-static'
    },
    {
      displayName: 'Config Directory',
      name: 'configDir',
      type: 'string',
      placeholder: '.storybook'
    },
    {
      displayName: 'Static Directory',
      name: 'staticDir',
      type: 'string',
      placeholder: 'public'
    },
    {
      displayName: 'Build Docs',
      name: 'docs',
      type: 'boolean',
      default: true
    }
  ]
}
