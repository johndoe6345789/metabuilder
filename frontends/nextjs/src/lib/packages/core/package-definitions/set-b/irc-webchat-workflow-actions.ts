import type { PackageContent } from '../../package-types'
import { commandActions } from './irc-webchat/actions/commands'
import { eventActions } from './irc-webchat/actions/events'

type IrcWebchatWorkflows = Pick<PackageContent, 'workflows' | 'luaScripts'>

const mergeActions = (...actions: IrcWebchatWorkflows[]): IrcWebchatWorkflows => ({
  workflows: actions.flatMap((action) => action.workflows),
  luaScripts: actions.flatMap((action) => action.luaScripts),
})

export const createIrcWebchatWorkflowActions = (): IrcWebchatWorkflows =>
  mergeActions(commandActions, eventActions)
