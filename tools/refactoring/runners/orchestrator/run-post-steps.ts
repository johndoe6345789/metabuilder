import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const runCommand = async (cmd: string): Promise<{ stdout: string; stderr: string }> => {
  try {
    return await execAsync(cmd, { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 })
  } catch (error: any) {
    return { stdout: error.stdout || '', stderr: error.stderr || error.message }
  }
}

export const runLintTypecheckAndTests = async (options: { skipLint: boolean; skipTest: boolean }) => {
  if (!options.skipLint) {
    console.log('\n' + '='.repeat(60))
    console.log('PHASE 2: LINTING & IMPORT FIXING')
    console.log('='.repeat(60) + '\n')
    console.log('🔧 Running ESLint with --fix...')
    const lintResult = await runCommand('npm run lint:fix')
    console.log(lintResult.stdout)
    if (lintResult.stderr && !lintResult.stderr.includes('warning')) {
      console.log('⚠️  Lint stderr:', lintResult.stderr)
    }
    console.log('  ✅ Linting complete')
  }

  console.log('\n' + '='.repeat(60))
  console.log('PHASE 3: TYPE CHECKING')
  console.log('='.repeat(60) + '\n')
  const typecheckResult = await runCommand('npm run typecheck')
  if (typecheckResult.stderr.includes('error TS')) {
    console.log('❌ Type errors detected:')
    console.log(typecheckResult.stderr.split('\n').slice(0, 20).join('\n'))
    console.log('\n⚠️  Please fix type errors before committing')
  } else {
    console.log('  ✅ No type errors')
  }

  if (!options.skipTest) {
    console.log('\n' + '='.repeat(60))
    console.log('PHASE 4: TESTING')
    console.log('='.repeat(60) + '\n')
    console.log('🧪 Running unit tests...')
    const testResult = await runCommand('npm run test:unit -- --run')
    if (testResult.stderr.includes('FAIL') || testResult.stdout.includes('FAIL')) {
      console.log('❌ Some tests failed')
      console.log(testResult.stdout.split('\n').slice(-30).join('\n'))
    } else {
      console.log('  ✅ All tests passed')
    }
  }
}
