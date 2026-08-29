'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { ChatContent } from './ChatContent'

export default function ChatPage() {
  return (
    <WorkspacePageSlot path="/irc">
      <LevelGate minLevel={1} levelName="User">
        <ChatContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
