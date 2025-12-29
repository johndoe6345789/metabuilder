import type { User } from '@/lib/level-types'

import { IRCWebchatDeclarative } from '../../misc/demos/IRCWebchatDeclarative'
import { ResultsPane } from '../sections/ResultsPane'

interface ChatTabContentProps {
  user: User
}

export function ChatTabContent({ user }: ChatTabContentProps) {
  return (
    <ResultsPane
      title="Webchat"
      description="Collaborate with other builders in real-time via the IRC channel."
    >
      <IRCWebchatDeclarative user={user} channelName="general" />
    </ResultsPane>
  )
}
