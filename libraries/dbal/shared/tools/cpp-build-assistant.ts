import path from 'path'
import { runCppBuildAssistant } from './cpp-build-assistant/runner'

export { CppBuildAssistant, createAssistant } from './cpp-build-assistant'
export { createCppBuildAssistantConfig } from './cpp-build-assistant/config'
export { runCppBuildAssistant } from './cpp-build-assistant/runner'

if (require.main === module) {
  const args = process.argv.slice(2)
  const projectRoot = path.join(__dirname, '..')

  runCppBuildAssistant(args, projectRoot)
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error(error?.message || error)
      process.exit(1)
    })
}
