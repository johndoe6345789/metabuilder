/**
 * Strict typecheck for src/ only.
 *
 * tsc has no way to limit diagnostics to a subtree -- it follows imports into
 * the sibling libraries, which are not clean under these flags and are not
 * ours to fix. So it runs over everything and this filters to src/, failing
 * only on the code this repo owns.
 */
import { spawnSync } from 'node:child_process'

const result = spawnSync(
  'npx',
  ['tsc', '--noEmit', '-p', 'tsconfig.strict.json'],
  { encoding: 'utf-8' }
)

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
const ours = output
  .split('\n')
  .filter(line => /^src\/.*error TS/.test(line))

if (ours.length > 0) {
  console.error(ours.join('\n'))
  console.error(`\n${ours.length} strict type error(s) in src/`)
  process.exit(1)
}

console.log('src/ is clean under the strict compiler options.')
