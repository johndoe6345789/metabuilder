import { CppBuildAssistant } from './index'
import { createCppBuildAssistantConfig } from './config'
import { runCli } from './cli'

export const runCppBuildAssistant = async (args: string[], projectRoot?: string): Promise<boolean> => {
  const config = createCppBuildAssistantConfig(projectRoot)
  const assistant = new CppBuildAssistant(config)

  return runCli(args, assistant)
}
