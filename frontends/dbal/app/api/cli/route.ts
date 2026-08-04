import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { verifyAdminCaller } from '@/adminAuth'

const execFileAsync = promisify(execFile)

const CLI_PATH = '/usr/local/bin/metabuilder-cli'
const DBAL_URL = process.env.METABUILDER_BASE_URL ?? process.env.DBAL_DAEMON_URL ?? 'http://dbal:8080'
const MAX_TIMEOUT = 15000

export async function POST(request: NextRequest) {
  const auth = await verifyAdminCaller(request)
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { command } = await request.json()

  if (!command || typeof command !== 'string') {
    return NextResponse.json({ error: 'Missing command' }, { status: 400 })
  }

  // Parse the command string into args
  // "dbal list Snippet" → ["dbal", "list", "Snippet"]
  const args = command.trim().split(/\s+/)

  // Remove leading "dbal" or "metabuilder-cli" if present — it's the binary itself
  if (args[0] === 'dbal' || args[0] === 'metabuilder-cli') {
    args.shift()
  }

  // Prepend "dbal" subcommand if the first arg is a known DBAL command
  const dbalCommands = ['ping', 'list', 'read', 'create', 'update', 'delete', 'execute', 'rest', 'schema']
  const authCommands = ['session', 'login']
  const userCommands = ['list', 'get']

  // Route to the right subcommand
  let finalArgs: string[]
  if (dbalCommands.includes(args[0])) {
    finalArgs = ['dbal', ...args]
  } else if (args[0] === 'auth') {
    finalArgs = args
  } else if (args[0] === 'user' || args[0] === 'tenant') {
    finalArgs = args
  } else if (args[0] === 'package') {
    finalArgs = args
  } else {
    // Pass through as-is
    finalArgs = args
  }

  try {
    const env = {
      ...process.env,
      METABUILDER_BASE_URL: DBAL_URL,
      DBAL_ADMIN_TOKEN: auth.adminToken,
    }

    const { stdout, stderr } = await execFileAsync(CLI_PATH, finalArgs, {
      timeout: MAX_TIMEOUT,
      maxBuffer: 1024 * 1024,
      env: env as NodeJS.ProcessEnv,
    })

    // Try to parse stdout as JSON, otherwise return as structured text
    let data: unknown
    try {
      data = JSON.parse(stdout)
    } catch {
      const output = (stdout || '').trim()
      const err = (stderr || '').trim()
      data = { output: output || err || '(no output)' }
    }

    return NextResponse.json({
      status: 200,
      statusText: 'OK',
      data,
      command: `metabuilder-cli ${finalArgs.join(' ')}`,
      stderr: stderr || undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const error = err as { code?: string; stdout?: string; stderr?: string; message?: string }

    let data: unknown
    if (error.stdout) {
      try { data = JSON.parse(error.stdout) } catch { data = { output: error.stdout.trim() } }
    }

    return NextResponse.json({
      status: error.code === 'ETIMEDOUT' ? 408 : 500,
      statusText: error.code === 'ETIMEDOUT' ? 'Timeout' : 'CLI Error',
      data: data ?? { error: error.stderr || error.message || 'Unknown error' },
      command: `metabuilder-cli ${finalArgs.join(' ')}`,
      timestamp: new Date().toISOString(),
    })
  }
}
