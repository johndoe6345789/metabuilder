'use client'

import dynamic from 'next/dynamic'
import { Snippet } from '@/lib/types'
import { DebugPanel } from './DebugPanel'
import { CodeTabPanel } from './CodeTabPanel'
import { TabPanel } from './TabPanel'
import styles from './snippet-view-page.module.scss'
import type { ActiveTab } from './hooks/useSnippetViewPage'
import type { Debugger, FileList } from './snippetEditorPanels.types'
import type { UseCodeTerminalReturn } from '@/hooks/useCodeTerminal'

const CodeTerminal = dynamic(
  () =>
    import('@/components/features/code-runner/CodeTerminal').then(mod => ({
      default: mod.CodeTerminal,
    })),
  { ssr: false },
)

interface Props {
  snippet: Snippet
  viewSnippet: Snippet
  files: FileList
  activeFile: string
  activeTab: ActiveTab
  canPreview: boolean
  showPreview: boolean
  wordWrap: 'on' | 'off'
  debugger: Debugger
  onDebugStart: () => void
  terminal: UseCodeTerminalReturn
  onCodeChange: (v: string) => void
}

export function SnippetEditorPanels(p: Props) {
  const { snippet, activeTab, debugger: dbg } = p
  return (
    <>
      <TabPanel visible={activeTab === 'code'}>
        <CodeTabPanel {...p} />
      </TabPanel>
      <TabPanel visible={activeTab === 'terminal'}>
        <CodeTerminal
          language={snippet.language}
          files={p.files}
          entryPoint={snippet.entryPoint ?? p.activeFile}
          controller={p.terminal}
          debugOutput={dbg.state.output}
          debugActive={dbg.isActive}
        />
      </TabPanel>
      <TabPanel visible={activeTab === 'debug'}>
        <div className={styles.debugFull}>
          <DebugPanel
            language={snippet.language}
            debugger={dbg}
            onStart={p.onDebugStart}
          />
        </div>
      </TabPanel>
    </>
  )
}
