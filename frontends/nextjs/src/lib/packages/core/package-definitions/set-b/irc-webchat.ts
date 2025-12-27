import type { PackageContent, PackageManifest } from '../../package-types'
import { createIrcWebchatMetadata } from './irc-webchat-metadata'
import { createIrcWebchatUiSchema } from './irc-webchat-ui-schema'
import { createIrcWebchatValidation } from './irc-webchat-validation'
import { createIrcWebchatWorkflowActions } from './irc-webchat-workflow-actions'

export const ircWebchatPackage = (): { manifest: PackageManifest; content: PackageContent } => {
  const manifest = createIrcWebchatMetadata()
  const { schemas, seedData } = createIrcWebchatValidation()
  const { pages, componentHierarchy, componentConfigs } = createIrcWebchatUiSchema()
  const { workflows, luaScripts } = createIrcWebchatWorkflowActions()

  return {
    manifest,
    content: {
      schemas,
      pages,
      workflows,
      luaScripts,
      componentHierarchy,
      componentConfigs,
      seedData,
    },
  }
}
