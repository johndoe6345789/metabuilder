import os from 'os'
import { BuildType } from './config'
import { COLORS, log } from './logging'
import { CppBuildAssistant } from './index'

export type CliCommand =
  | 'check'
  | 'init'
  | 'install'
  | 'configure'
  | 'build'
  | 'test'
  | 'clean'
  | 'rebuild'
  | 'full'
  | 'help'

export interface ParsedCliArgs {
  command: CliCommand
  buildType: BuildType
  jobs: number
  target?: string
  options: string[]
}

const parseBuildType = (options: string[]): BuildType => (options.includes('--debug') ? 'Debug' : 'Release')

const parseJobs = (options: string[]): number => {
  const jobsArg = options.find(option => option.startsWith('--jobs='))
  const parsedJobs = jobsArg ? parseInt(jobsArg.split('=')[1]) : Number.NaN

  return Number.isNaN(parsedJobs) ? os.cpus().length : parsedJobs
}

const parseTarget = (command: CliCommand, options: string[]): string | undefined => {
  if (command !== 'build') return undefined

  return options.find(option => !option.startsWith('--')) || 'all'
}

export const parseCliArgs = (args: string[]): ParsedCliArgs => {
  const command = (args[0] as CliCommand | undefined) || 'help'
  const options = args.slice(1)

  return {
    command,
    buildType: parseBuildType(options),
    jobs: parseJobs(options),
    target: parseTarget(command, options),
    options,
  }
}

export const showHelp = (): void => {
  console.log(`
${COLORS.bright}C++ Build Assistant${COLORS.reset} - Conan + Ninja Build Helper

${COLORS.cyan}USAGE:${COLORS.reset}
  npm run cpp:build [command] [options]

${COLORS.cyan}COMMANDS:${COLORS.reset}
  ${COLORS.green}check${COLORS.reset}              Check if all dependencies are installed
  ${COLORS.green}init${COLORS.reset}               Initialize project (create conanfile if missing)
  ${COLORS.green}install${COLORS.reset}            Install Conan dependencies
  ${COLORS.green}configure${COLORS.reset}          Configure CMake with Ninja generator
  ${COLORS.green}build${COLORS.reset} [target]     Build the project (default: all)
  ${COLORS.green}test${COLORS.reset}               Run tests with CTest
  ${COLORS.green}clean${COLORS.reset}              Remove build artifacts
  ${COLORS.green}rebuild${COLORS.reset}            Clean and rebuild
  ${COLORS.green}full${COLORS.reset}               Full workflow: check → install → configure → build
  ${COLORS.green}help${COLORS.reset}               Show this help message

${COLORS.cyan}OPTIONS:${COLORS.reset}
  --debug              Use Debug build type
  --release            Use Release build type (default)
  --jobs=N             Number of parallel build jobs (default: CPU count)

${COLORS.cyan}EXAMPLES:${COLORS.reset}
  npm run cpp:build check
  npm run cpp:build full
  npm run cpp:build build dbal_daemon
  npm run cpp:build build -- --debug
  npm run cpp:build test
`)
}

export const runCli = async (args: string[], assistant: CppBuildAssistant): Promise<boolean> => {
  const parsed = parseCliArgs(args)

  switch (parsed.command) {
    case 'check':
      return assistant.checkDependencies()
    case 'init':
      return assistant.createConanfile()
    case 'install':
      if (!assistant.checkDependencies()) return false
      return assistant.installConanDeps()
    case 'configure':
      if (!assistant.checkDependencies()) return false
      return assistant.configureCMake(parsed.buildType)
    case 'build':
      if (!assistant.checkDependencies()) return false
      return assistant.build(parsed.target, parsed.jobs)
    case 'test':
      return assistant.test()
    case 'clean':
      return assistant.clean()
    case 'rebuild':
      assistant.clean()
      if (!assistant.checkDependencies()) return false
      if (!assistant.configureCMake(parsed.buildType)) return false
      return assistant.build('all', parsed.jobs)
    case 'full':
      log.section('Full Build Workflow')
      if (!assistant.checkDependencies()) return false
      if (!assistant.createConanfile()) return false
      if (!assistant.installConanDeps()) return false
      if (!assistant.configureCMake(parsed.buildType)) return false
      return assistant.build('all', parsed.jobs)
    case 'help':
    default:
      showHelp()
      return true
  }
}
