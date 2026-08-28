'use client'

import { useState } from 'react'
import type { OpenFile } from './ide-types'
import { MonacoPane } from './MonacoPane'
import { ConsoleOutput } from './ConsoleOutput'
import { WorkflowJsonEditor } from './WorkflowJsonEditor'
import s from './EditorArea.module.scss'

type Tab = 'editor' | 'console' | 'workflowJson'

const TABS: { id: Tab; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'console', label: 'Console' },
  { id: 'workflowJson', label: 'Workflow JSON' },
]

interface EditorAreaProps {
  openFile: OpenFile | null
}

export function EditorArea({ openFile }: EditorAreaProps) {
  const [activeTab, setActiveTab] = useState<Tab>('editor')

  return (
    <div className={s.wrap}>
      <div className={s.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={
              tab.id === activeTab ? `${s.tabBtn} ${s.tabBtnActive}` : s.tabBtn
            }
            onClick={() => {
              setActiveTab(tab.id)
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={s.content}>
        {activeTab === 'editor' &&
          (openFile != null ? (
            <MonacoPane file={openFile} />
          ) : (
            <div className={s.empty}>Select a file to edit</div>
          ))}
        {activeTab === 'console' && <ConsoleOutput lines={[]} />}
        {activeTab === 'workflowJson' && <WorkflowJsonEditor />}
      </div>
    </div>
  )
}
