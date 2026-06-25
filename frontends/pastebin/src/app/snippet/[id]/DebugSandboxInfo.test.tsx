import { render, screen } from '@/test-utils'
import { DebugSandboxInfo } from './DebugSandboxInfo'

describe('DebugSandboxInfo', () => {
  it('shows the Python sandbox spec', () => {
    render(<DebugSandboxInfo language="Python" />)
    expect(screen.getByTestId('debug-sandbox-info')).toBeInTheDocument()
    expect(screen.getByText('python-debug:latest')).toBeInTheDocument()
    expect(screen.getByText('Python 3.11')).toBeInTheDocument()
    expect(screen.getByText(/debugpy/)).toBeInTheDocument()
  })

  it('maps C++ to the cpp runner image', () => {
    render(<DebugSandboxInfo language="C++" />)
    expect(screen.getByText('cpp-debug:latest')).toBeInTheDocument()
    expect(screen.getByText(/codelldb/)).toBeInTheDocument()
  })

  it('renders nothing for an unsupported language', () => {
    const { container } = render(<DebugSandboxInfo language="Ruby" />)
    expect(container).toBeEmptyDOMElement()
  })
})
