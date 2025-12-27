import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function runLintFix(workingDir: string, log: (message: string) => void): Promise<void> {
  log('\n🔧 Running ESLint to fix imports and formatting...')
  try {
    const { stdout, stderr } = await execAsync('npm run lint:fix', { cwd: workingDir })
    if (stdout) log(stdout)
    if (stderr) log(stderr)
    log('  ✅ Linting completed')
  } catch (error) {
    log(`  ⚠️  Linting had issues (may be expected): ${error}`)
  }
}
