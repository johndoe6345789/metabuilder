import path from 'path'

export type BuildType = 'Debug' | 'Release'

export interface CppBuildAssistantConfig {
  projectRoot: string
  cppDir: string
  buildDir: string
}

export const createCppBuildAssistantConfig = (projectRoot?: string): CppBuildAssistantConfig => {
  const resolvedProjectRoot = projectRoot || path.join(__dirname, '..')
  const cppDir = path.join(resolvedProjectRoot, 'cpp')

  return {
    projectRoot: resolvedProjectRoot,
    cppDir,
    buildDir: path.join(cppDir, 'build'),
  }
}
