import { EnforcementConfig } from './types'

const DEFAULT_LIMITS = {
  tsx: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 5, maxFunctionParams: 5 },
  ts: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 10, maxFunctionParams: 5 },
  jsx: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 5, maxFunctionParams: 5 },
  js: { maxLoc: 150, maxTotalLines: 200, maxNestingDepth: 3, maxExports: 10, maxFunctionParams: 5 },
}

export const DEFAULT_CONFIG: EnforcementConfig = {
  rootDir: process.cwd(),
  excludeDirs: ['node_modules', 'build', '.next', 'dist', '.git', 'coverage', '.venv'],
  reportFileName: 'size-limits-report.json',
  limits: DEFAULT_LIMITS,
}
