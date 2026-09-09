import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

interface MonacoEditorMockProps {
  language?: string
  value?: string
  theme?: string
  loading?: React.ReactNode
  options?: { readOnly?: boolean }
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

  /**
   * The editor itself is fetched from a public CDN at runtime and
   * `monaco-editor` is not a dependency, so on a network that cannot
   * reach it the pane was a blank box for ever with nothing to say why.
   */
  it('offers the file as plain text while the editor is not there', () => {
    render(
      <MonacoPane
        file={{ path: 'a.css', language: 'css', content: '.card { }' }}
      />
    )
    const loading = monacoReact.default.mock.calls.at(-1)?.[0]?.loading
    // Rendered on its own: this is what stands in for the editor when
    // the CDN it comes from cannot be reached.
    const { container } = render(<>{loading}</>, {
      container: document.body.appendChild(document.createElement('div')),
    })
    expect(container.querySelector('pre')?.textContent).toBe('.card { }')
  })

  // Nothing here writes: there is no onChange and no save, so an
  // editable pane would take a founder's typing and discard it.
  it('does not pretend to be editable', () => {
    render(
      <MonacoPane file={{ path: 'a.css', language: 'css', content: 'x' }} />
    )
    const call = monacoReact.default.mock.calls.at(-1)?.[0]
    expect(call?.options?.readOnly).toBe(true)
    expect(call).not.toHaveProperty('onChange')
  })
})
