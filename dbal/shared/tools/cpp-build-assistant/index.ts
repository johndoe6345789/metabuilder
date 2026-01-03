import os from 'os'
import path from 'path'
import { CppBuildAssistantConfig, BuildType, createCppBuildAssistantConfig } from './config'
import { COLORS, log } from './logging'
import { checkDependencies } from './dependencies'
import { cleanBuild, configureCMake, ensureConanFile, execCommand, installConanDeps, buildTarget, runTests } from './workflow'

export class CppBuildAssistant {
  private config: CppBuildAssistantConfig

  constructor(config?: CppBuildAssistantConfig) {
    this.config = config || createCppBuildAssistantConfig()
  }

  get projectRoot(): string {
    return this.config.projectRoot
  }

  get cppDir(): string {
    return this.config.cppDir
  }

  get buildDir(): string {
    return this.config.buildDir
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

  configureCMake(buildType: BuildType = 'Release'): boolean {
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
}

export const createAssistant = (projectRoot?: string): CppBuildAssistant => {
  const config = createCppBuildAssistantConfig(projectRoot || path.join(__dirname, '..'))
  return new CppBuildAssistant(config)
}

export { BuildType, CppBuildAssistantConfig, COLORS, log }
