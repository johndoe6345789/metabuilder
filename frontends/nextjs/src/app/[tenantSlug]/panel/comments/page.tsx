'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { CommentsContent } from './CommentsContent'

export default function CommentsPage() {
  return (
    <WorkspacePageSlot path="/comments">
      <LevelGate minLevel={1} levelName="User">
        <CommentsContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
