import path from 'path'
import { CppBuildAssistant, runCppBuildAssistant } from './cpp-build-assistant/index'

export { CppBuildAssistant, runCppBuildAssistant }

if (require.main === module) {
  const args = process.argv.slice(2)

  runCppBuildAssistant(args, path.join(__dirname, '..'))
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error(error?.message || error)
      process.exit(1)
    })
}
