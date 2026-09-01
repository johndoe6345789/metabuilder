import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

interface MonacoEditorMockProps {
  language?: string
  value?: string
  theme?: string
}

const monacoReact = vi.hoisted(() => ({
  default: vi.fn((props: MonacoEditorMockProps) => (
    <div data-testid="monaco-editor" data-language={props.language}>
      {props.value}
    </div>
  )),
}))
vi.mock('@monaco-editor/react', () => monacoReact)

import { MonacoPane } from './MonacoPane'

describe('MonacoPane', () => {
  it('mounts the Monaco editor with the open file content and language', async () => {
    render(
      <MonacoPane
        file={{ path: 'a.json', language: 'json', content: '{"a":1}' }}
      />
    )
    const editor = await screen.findByTestId('monaco-editor')
    expect(editor.getAttribute('data-language')).toBe('json')
    expect(editor.textContent).toBe('{"a":1}')
  })

  it('passes the dark theme and the file content through to the editor', async () => {
    render(
      <MonacoPane
        file={{ path: 'b.ts', language: 'typescript', content: 'const x = 1' }}
      />
    )
    await screen.findByTestId('monaco-editor')
    const call = monacoReact.default.mock.calls.at(-1)?.[0]
    expect(call?.theme).toBe('vs-dark')
    expect(call?.value).toBe('const x = 1')
  })
})
