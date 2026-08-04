/**
 * Component tests for dbal UI components.
 * SCSS modules are handled by vitest's css.modules setting.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import type { QueryHistoryEntry, QueryResponse } from '../types'

// ─── Mock all SCSS module imports ───────────────────────────────────────────
vi.mock('../QueryConsole.module.scss', () => ({
  default: new Proxy({}, { get: (_t, p) => String(p) }),
}))

// ─── Import components after mocks ──────────────────────────────────────────
import { LoginScreen } from './LoginScreen'
import { ModeBar } from './ModeBar'
import { CliPanel } from './CliPanel'
import { GuiField } from './GuiField'
import { GuiPanel } from './GuiPanel'
import { ResponsePanel } from './ResponsePanel'
import { HistorySidebar } from './HistorySidebar'

// ─── Helper ─────────────────────────────────────────────────────────────────
function makeEntry(overrides?: Partial<QueryHistoryEntry>): QueryHistoryEntry {
  return {
    id: '1',
    method: 'GET',
    path: '/pastebin/pastebin/Snippet',
    status: 200,
    statusText: 'OK',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// LoginScreen
// ════════════════════════════════════════════════════════════════════════════
describe('LoginScreen', () => {
  it('renders the login heading', () => {
    render(<LoginScreen onLogin={vi.fn()} />)
    expect(screen.getByText('DBAL Query Console')).toBeTruthy()
  })

  it('renders the sign-in button', () => {
    render(<LoginScreen onLogin={vi.fn()} />)
    expect(screen.getByTestId('dbal-sso-login-button')).toBeTruthy()
  })

  it('calls onLogin when the sign-in button is clicked', () => {
    const onLogin = vi.fn()
    render(<LoginScreen onLogin={onLogin} />)
    fireEvent.click(screen.getByTestId('dbal-sso-login-button'))
    expect(onLogin).toHaveBeenCalledTimes(1)
  })

  it('shows the error dialog and clears it', () => {
    const onClearError = vi.fn()
    render(<LoginScreen onLogin={vi.fn()} error="Sign-in failed" onClearError={onClearError} />)
    expect(screen.getByText('Sign-in failed')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClearError).toHaveBeenCalledTimes(1)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ModeBar
// ════════════════════════════════════════════════════════════════════════════
describe('ModeBar', () => {
  it('renders CLI and GUI buttons', () => {
    render(
      <ModeBar mode="cli" onCli={vi.fn()} onGui={vi.fn()} onDisconnect={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'CLI' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'GUI' })).toBeTruthy()
  })

  it('calls onCli when CLI button is clicked', () => {
    const onCli = vi.fn()
    render(<ModeBar mode="cli" onCli={onCli} onGui={vi.fn()} onDisconnect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'CLI' }))
    expect(onCli).toHaveBeenCalled()
  })

  it('calls onGui when GUI button is clicked', () => {
    const onGui = vi.fn()
    render(<ModeBar mode="cli" onCli={vi.fn()} onGui={onGui} onDisconnect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'GUI' }))
    expect(onGui).toHaveBeenCalled()
  })

  it('calls onDisconnect when Disconnect is clicked', () => {
    const onDisconnect = vi.fn()
    render(<ModeBar mode="cli" onCli={vi.fn()} onGui={vi.fn()} onDisconnect={onDisconnect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }))
    expect(onDisconnect).toHaveBeenCalled()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// GuiField
// ════════════════════════════════════════════════════════════════════════════
describe('GuiField', () => {
  it('renders label and input', () => {
    render(<GuiField label="Tenant" value="pastebin" onChange={vi.fn()} />)
    expect(screen.getByText('Tenant')).toBeTruthy()
    const input = screen.getByDisplayValue('pastebin') as HTMLInputElement
    expect(input).toBeTruthy()
  })

  it('calls onChange when input changes', () => {
    const onChange = vi.fn()
    render(<GuiField label="Tenant" value="" onChange={onChange} placeholder="hint" />)
    fireEvent.change(screen.getByPlaceholderText('hint'), { target: { value: 'acme' } })
    expect(onChange).toHaveBeenCalledWith('acme')
  })

  it('renders with full prop', () => {
    const { container } = render(
      <GuiField label="QP" value="" onChange={vi.fn()} full />
    )
    // Just check it renders without error
    expect(container.querySelector('input')).toBeTruthy()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// CliPanel
// ════════════════════════════════════════════════════════════════════════════
describe('CliPanel', () => {
  it('renders the CLI input and Run button', () => {
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput=""
        loading={false}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={vi.fn()}
      />
    )
    expect(screen.getByPlaceholderText('dbal list Snippet')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Run' })).toBeTruthy()
  })

  it('shows ... when loading', () => {
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput="dbal ping"
        loading={true}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: '...' })).toBeTruthy()
  })

  it('disables Run button when loading', () => {
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput="dbal ping"
        loading={true}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={vi.fn()}
      />
    )
    const btn = screen.getByRole('button', { name: '...' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('disables Run button when input is empty', () => {
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput=""
        loading={false}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={vi.fn()}
      />
    )
    const btn = screen.getByRole('button', { name: 'Run' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('calls onRun when Run clicked', () => {
    const onRun = vi.fn()
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput="dbal ping"
        loading={false}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={onRun}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    expect(onRun).toHaveBeenCalled()
  })

  it('calls onRun on Enter key when not loading', () => {
    const onRun = vi.fn()
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput="dbal ping"
        loading={false}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={onRun}
      />
    )
    fireEvent.keyDown(screen.getByPlaceholderText('dbal list Snippet'), { key: 'Enter' })
    expect(onRun).toHaveBeenCalled()
  })

  it('does not call onRun on Enter when loading', () => {
    const onRun = vi.fn()
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput="dbal ping"
        loading={true}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={onRun}
      />
    )
    fireEvent.keyDown(screen.getByPlaceholderText('dbal list Snippet'), { key: 'Enter' })
    expect(onRun).not.toHaveBeenCalled()
  })

  it('calls onInputChange when input changes', () => {
    const onInputChange = vi.fn()
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput=""
        loading={false}
        cliRef={ref}
        onInputChange={onInputChange}
        onRun={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('dbal list Snippet'), {
      target: { value: 'dbal ping' },
    })
    expect(onInputChange).toHaveBeenCalledWith('dbal ping')
  })

  it('renders CLI examples', () => {
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput=""
        loading={false}
        cliRef={ref}
        onInputChange={vi.fn()}
        onRun={vi.fn()}
      />
    )
    expect(screen.getByText('dbal ping')).toBeTruthy()
  })

  it('clicking an example sets it as input', () => {
    const onInputChange = vi.fn()
    const ref = createRef<HTMLInputElement | null>()
    render(
      <CliPanel
        cliInput=""
        loading={false}
        cliRef={ref}
        onInputChange={onInputChange}
        onRun={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('dbal ping'))
    expect(onInputChange).toHaveBeenCalledWith('dbal ping')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ResponsePanel
// ════════════════════════════════════════════════════════════════════════════
describe('ResponsePanel', () => {
  it('renders loading spinner when loading=true', () => {
    render(<ResponsePanel loading={true} response={null} />)
    expect(screen.getByText(/Sending request/)).toBeTruthy()
  })

  it('renders nothing when not loading and no response', () => {
    const { container } = render(<ResponsePanel loading={false} response={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders status badge on success response', () => {
    const response: QueryResponse = {
      status: 200,
      statusText: 'OK',
      data: { items: [] },
      url: '/test',
      timestamp: '2026-01-01T00:00:00.000Z',
    }
    render(<ResponsePanel loading={false} response={response} />)
    expect(screen.getByText(/200.*OK/)).toBeTruthy()
  })

  it('renders error status badge', () => {
    const response: QueryResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      data: { error: 'oops' },
      url: '/test',
      timestamp: '2026-01-01T00:00:00.000Z',
    }
    render(<ResponsePanel loading={false} response={response} />)
    expect(screen.getByText(/500.*Internal Server Error/)).toBeTruthy()
  })

  it('renders plain output string directly', () => {
    const response: QueryResponse = {
      status: 200,
      statusText: 'OK',
      data: { output: 'pong' },
      url: '/test',
      timestamp: '2026-01-01T00:00:00.000Z',
    }
    render(<ResponsePanel loading={false} response={response} />)
    expect(screen.getByText('pong')).toBeTruthy()
  })

  it('renders JSON data with syntax highlighting', () => {
    const response: QueryResponse = {
      status: 200,
      statusText: 'OK',
      data: { name: 'Alice' },
      url: '/test',
      timestamp: '2026-01-01T00:00:00.000Z',
    }
    const { container } = render(<ResponsePanel loading={false} response={response} />)
    const pre = container.querySelector('pre')
    expect(pre).toBeTruthy()
    expect(pre?.innerHTML).toContain('Alice')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// HistorySidebar
// ════════════════════════════════════════════════════════════════════════════
describe('HistorySidebar', () => {
  it('renders "No queries yet" when history is empty', () => {
    render(<HistorySidebar history={[]} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('No queries yet')).toBeTruthy()
  })

  it('does not render Clear button when history is empty', () => {
    render(<HistorySidebar history={[]} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
  })

  it('renders Clear button when history has entries', () => {
    render(
      <HistorySidebar
        history={[makeEntry()]}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy()
  })

  it('calls onClear when Clear is clicked', () => {
    const onClear = vi.fn()
    render(
      <HistorySidebar history={[makeEntry()]} onSelect={vi.fn()} onClear={onClear} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalled()
  })

  it('renders a CLI entry with $ prefix', () => {
    const entry = makeEntry({ cli: 'dbal ping' })
    render(
      <HistorySidebar history={[entry]} onSelect={vi.fn()} onClear={vi.fn()} />
    )
    expect(screen.getByText('$ dbal ping')).toBeTruthy()
  })

  it('renders a GUI entry with method and path', () => {
    const entry = makeEntry({ cli: undefined })
    render(
      <HistorySidebar history={[entry]} onSelect={vi.fn()} onClear={vi.fn()} />
    )
    expect(screen.getByText('GET')).toBeTruthy()
    expect(screen.getByText('/pastebin/pastebin/Snippet')).toBeTruthy()
  })

  it('calls onSelect when an entry is clicked', () => {
    const onSelect = vi.fn()
    const entry = makeEntry()
    render(
      <HistorySidebar history={[entry]} onSelect={onSelect} onClear={vi.fn()} />
    )
    fireEvent.click(screen.getByText('GET'))
    expect(onSelect).toHaveBeenCalledWith(entry)
  })

  it('renders 404 status in error color', () => {
    const entry = makeEntry({ status: 404, cli: undefined })
    render(
      <HistorySidebar history={[entry]} onSelect={vi.fn()} onClear={vi.fn()} />
    )
    const statusEl = screen.getByText('404')
    expect(statusEl).toBeTruthy()
  })

  it('handles invalid timestamp gracefully', () => {
    const entry = makeEntry({ timestamp: 'not-a-date' })
    // Should not throw even with invalid date
    expect(() =>
      render(<HistorySidebar history={[entry]} onSelect={vi.fn()} onClear={vi.fn()} />)
    ).not.toThrow()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// GuiPanel
// ════════════════════════════════════════════════════════════════════════════
describe('GuiPanel', () => {
  const defaultProps = {
    method: 'GET' as const,
    tenant: 'pastebin',
    pkg: 'pastebin',
    entity: 'Snippet',
    entityId: '',
    queryParams: '',
    body: '',
    loading: false,
    pathPreview: '/pastebin/pastebin/Snippet',
    onMethodChange: vi.fn(),
    onTenantChange: vi.fn(),
    onPkgChange: vi.fn(),
    onEntityChange: vi.fn(),
    onEntityIdChange: vi.fn(),
    onQueryParamsChange: vi.fn(),
    onBodyChange: vi.fn(),
    onExecute: vi.fn(),
  }

  beforeEach(() => vi.clearAllMocks())

  it('renders all HTTP method buttons', () => {
    render(<GuiPanel {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'GET' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'POST' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'PUT' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'DELETE' })).toBeTruthy()
  })

  it('calls onMethodChange when a method button is clicked', () => {
    const onMethodChange = vi.fn()
    render(<GuiPanel {...defaultProps} onMethodChange={onMethodChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'POST' }))
    expect(onMethodChange).toHaveBeenCalledWith('POST')
  })

  it('renders Query Parameters field for GET method', () => {
    render(<GuiPanel {...defaultProps} method="GET" />)
    expect(screen.getByPlaceholderText('limit=10&offset=0')).toBeTruthy()
  })

  it('does not render Query Parameters field for POST method', () => {
    render(<GuiPanel {...defaultProps} method="POST" />)
    expect(screen.queryByPlaceholderText('limit=10&offset=0')).toBeNull()
  })

  it('renders JSON Body textarea for POST method', () => {
    render(<GuiPanel {...defaultProps} method="POST" />)
    expect(screen.getByText('JSON Body')).toBeTruthy()
  })

  it('renders JSON Body textarea for PUT method', () => {
    render(<GuiPanel {...defaultProps} method="PUT" />)
    expect(screen.getByText('JSON Body')).toBeTruthy()
  })

  it('does not render JSON Body for GET method', () => {
    render(<GuiPanel {...defaultProps} method="GET" />)
    expect(screen.queryByText('JSON Body')).toBeNull()
  })

  it('renders Execute button', () => {
    render(<GuiPanel {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Execute' })).toBeTruthy()
  })

  it('shows "Executing..." when loading', () => {
    render(<GuiPanel {...defaultProps} loading={true} />)
    expect(screen.getByRole('button', { name: 'Executing...' })).toBeTruthy()
  })

  it('calls onExecute when Execute is clicked', () => {
    const onExecute = vi.fn()
    render(<GuiPanel {...defaultProps} onExecute={onExecute} />)
    fireEvent.click(screen.getByRole('button', { name: 'Execute' }))
    expect(onExecute).toHaveBeenCalled()
  })

  it('disables Execute when loading', () => {
    render(<GuiPanel {...defaultProps} loading={true} />)
    const btn = screen.getByRole('button', { name: 'Executing...' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('shows path preview', () => {
    render(<GuiPanel {...defaultProps} pathPreview="/pastebin/pastebin/Snippet" />)
    expect(screen.getByText('GET /pastebin/pastebin/Snippet')).toBeTruthy()
  })
})
