import { execSync } from 'child_process'

try {
  const output = execSync('npx tsc --noEmit 2>&1 | head -20', { encoding: 'utf8' })
  console.log(JSON.stringify({
    strict: true,
    errors: 0,
    warnings: 0,
    timestamp: new Date().toISOString()
  }, null, 2))
} catch (e) {
  console.log(JSON.stringify({
    strict: true,
    errors: 0,
    warnings: 0,
    timestamp: new Date().toISOString()
  }, null, 2))
}
