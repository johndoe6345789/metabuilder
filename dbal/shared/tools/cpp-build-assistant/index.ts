import os from 'os'
import path from 'path'
import { COLORS, log } from './logging'
import { checkDependencies } from './dependencies'
import { cleanBuild, configureCMake, ensureConanFile, execCommand, installConanDeps, buildTarget, runTests } from './workflow'

export class CppBuildAssistant {
  private projectRoot: string
  private cppDir: string
  private buildDir: string

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || path.join(__dirname, '..')
    this.cppDir = path.join(this.projectRoot, 'cpp')
    this.buildDir = path.join(this.cppDir, 'build')
  }

  checkDependencies(): boolean {
    return checkDependencies()
  }

  createConanfile(): boolean {
    return ensureConanFile(this.cppDir)
  }

  installConanDeps(): boolean {
    return installConanDeps(this.cppDir, execCommand)
  }

  configureCMake(buildType: 'Debug' | 'Release' = 'Release'): boolean {
    return configureCMake(this.cppDir, buildType, execCommand)
  }

  build(target = 'all', jobs = os.cpus().length): boolean {
    return buildTarget(this.cppDir, target, jobs, execCommand)
  }

  test(): boolean {
    return runTests(this.cppDir, execCommand)
  }

  clean(): boolean {
    return cleanBuild(this.buildDir)
  }

  async run(args: string[]): Promise<boolean> {
    const command = args[0] || 'help'
    const options = args.slice(1)

    const buildType = options.includes('--debug') ? 'Debug' : 'Release'
    const jobsArg = options.find(option => option.startsWith('--jobs='))
    const jobs = jobsArg ? parseInt(jobsArg.split('=')[1]) : os.cpus().length

    switch (command) {
      case 'check':
        return this.checkDependencies()
      case 'init':
        return this.createConanfile()
      case 'install':
        if (!this.checkDependencies()) return false
        return this.installConanDeps()
      case 'configure':
        if (!this.checkDependencies()) return false
        return this.configureCMake(buildType as 'Debug' | 'Release')
      case 'build':
        if (!this.checkDependencies()) return false
        const target = options.find(option => !option.startsWith('--')) || 'all'
        return this.build(target, jobs)
      case 'test':
        return this.test()
      case 'clean':
        return this.clean()
      case 'rebuild':
        this.clean()
        if (!this.checkDependencies()) return false
        if (!this.configureCMake(buildType as 'Debug' | 'Release')) return false
        return this.build('all', jobs)
      case 'full':
        log.section('Full Build Workflow')
        if (!this.checkDependencies()) return false
        if (!this.createConanfile()) return false
        if (!this.installConanDeps()) return false
        if (!this.configureCMake(buildType as 'Debug' | 'Release')) return false
        return this.build('all', jobs)
      case 'help':
      default:
        this.showHelp()
        return true
    }
  }

  private showHelp(): void {
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
}

export const runCppBuildAssistant = async (args: string[], projectRoot?: string) => {
  const assistant = new CppBuildAssistant(projectRoot || path.join(__dirname, '..'))
  return assistant.run(args)
}
