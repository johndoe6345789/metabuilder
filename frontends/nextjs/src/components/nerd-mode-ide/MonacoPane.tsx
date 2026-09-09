'use client'

import dynamic from 'next/dynamic'
import type { OpenFile } from './ide-types'
import s from './MonacoPane.module.scss'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
})

/**
 * Read-only on purpose.
 *
 * Nothing here writes: there is no onChange and no save, so an editable
 * pane would take a founder's typing and silently discard it. These
 * artefacts have their own editors -- the Components, Styles and
 * Workflows tabs -- and hand-editing the JSON of a live page tree is a
 * good way to lose one.
 */
const EDITOR_OPTIONS = {
  readOnly: true,
  fontSize: 13,
  fontFamily: 'JetBrains Mono, monospace',
  minimap: { enabled: false },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  lineNumbers: 'on' as const,
}

interface MonacoPaneProps {
  file: OpenFile
}

/**
 * The file, plainly, while the editor loads -- or instead of it.
 *
 * `@monaco-editor/react` fetches the editor itself from a public CDN at
 * runtime and `monaco-editor` is not a dependency here, so on any
 * network that cannot reach jsdelivr -- an air-gapped install, a
 * restricted one, an offline laptop -- the pane was a blank box for ever
 * with nothing to say why. This is read-only anyway, so the plain text
 * is a complete answer rather than a placeholder.
 */
function PlainText({ file }: MonacoPaneProps) {
  return <pre className={s.plain}>{file.content}</pre>
}

export function MonacoPane({ file }: MonacoPaneProps) {
  return (
    <div className={s.wrap}>
      <MonacoEditor
        height="100%"
        language={file.language}
        value={file.content}
        theme="vs-dark"
        options={EDITOR_OPTIONS}
        loading={<PlainText file={file} />}
      />
    </div>
  )
}
