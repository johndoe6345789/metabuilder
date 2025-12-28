import type { PackageContent } from '../../package-types'
import { ircWebchatComponentConfig } from './irc-webchat/schema/layout'

type IrcWebchatUiSchema = Pick<PackageContent, 'pages' | 'componentHierarchy' | 'componentConfigs'>

const pages: IrcWebchatUiSchema['pages'] = [
  {
    id: 'page_chat',
    path: '/chat',
    title: 'IRC Webchat',
    level: 2,
    componentTree: [
      {
        id: 'comp_chat_root',
        type: 'IRCWebchat',
        props: {
          channelName: 'general',
        },
        children: [],
      },
    ],
    requiresAuth: true,
    requiredRole: 'user',
  },
]

const componentHierarchy: IrcWebchatUiSchema['componentHierarchy'] = {
  page_chat: {
    id: 'comp_chat_root',
    type: 'IRCWebchat',
    props: {},
    children: [],
  },
}

const componentConfigs: IrcWebchatUiSchema['componentConfigs'] = {
  IRCWebchat: ircWebchatComponentConfig,
}

export const createIrcWebchatUiSchema = (): IrcWebchatUiSchema => ({
  pages,
  componentHierarchy,
  componentConfigs,
})
