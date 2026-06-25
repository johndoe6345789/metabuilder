/**
 * Tests for ValidationModal component
 */

const mockValidate = jest.fn()

jest.mock('@metabuilder/hooks-data', () => ({
  useWorkflow: jest.fn(() => ({
    validate: mockValidate,
  })),
}))

jest.mock('../ValidationResults', () => ({
  __esModule: true,
  default: ({ validation }: any) => (
    <div data-testid="validation-results">
      <span data-testid="valid-status">{validation.valid ? 'valid' : 'invalid'}</span>
      {validation.errors.map((e: string, i: number) => (
        <span key={i} data-testid={`error-${i}`}>{e}</span>
      ))}
    </div>
  ),
}))

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ValidationModal from '../ValidationModal'

describe('ValidationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render anything while validation is loading', () => {
    mockValidate.mockResolvedValue(null)
    // Temporarily resolve nothing - component returns null when validation is null
    mockValidate.mockImplementation(() => new Promise(() => {})) // never resolves
    render(<ValidationModal workflowId="wf-1" onClose={jest.fn()} />)
    expect(screen.queryByText('Validation Results')).not.toBeInTheDocument()
  })

  it('should show validation results after validate resolves', async () => {
    mockValidate.mockResolvedValue({ valid: true, errors: [], warnings: [] })
    render(<ValidationModal workflowId="wf-1" onClose={jest.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Validation Results')).toBeInTheDocument()
    })
  })

  it('should render ValidationResults component', async () => {
    mockValidate.mockResolvedValue({ valid: true, errors: [], warnings: [] })
    render(<ValidationModal workflowId="wf-1" onClose={jest.fn()} />)
    await waitFor(() => {
      expect(screen.getByTestId('validation-results')).toBeInTheDocument()
    })
  })

  it('should call onClose when backdrop clicked', async () => {
    mockValidate.mockResolvedValue({ valid: true, errors: [], warnings: [] })
    const onClose = jest.fn()
    render(<ValidationModal workflowId="wf-1" onClose={onClose} />)
    await waitFor(() => screen.getByText('Validation Results'))
    // Click the outer backdrop div
    fireEvent.click(screen.getByText('Validation Results').closest('div')!.parentElement!.parentElement!)
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when Close button clicked', async () => {
    mockValidate.mockResolvedValue({ valid: true, errors: [], warnings: [] })
    const onClose = jest.fn()
    render(<ValidationModal workflowId="wf-1" onClose={onClose} />)
    await waitFor(() => screen.getByText('Close'))
    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should show valid status in results', async () => {
    mockValidate.mockResolvedValue({ valid: true, errors: [], warnings: [] })
    render(<ValidationModal workflowId="wf-1" onClose={jest.fn()} />)
    await waitFor(() => {
      expect(screen.getByTestId('valid-status')).toHaveTextContent('valid')
    })
  })

  it('should show invalid status when errors exist', async () => {
    mockValidate.mockResolvedValue({ valid: false, errors: ['Node disconnected'], warnings: [] })
    render(<ValidationModal workflowId="wf-1" onClose={jest.fn()} />)
    await waitFor(() => {
      expect(screen.getByTestId('valid-status')).toHaveTextContent('invalid')
    })
  })

  it('should handle validate rejection gracefully', async () => {
    mockValidate.mockRejectedValue(new Error('Network error'))
    // Should not throw - component handles error in catch
    render(<ValidationModal workflowId="wf-1" onClose={jest.fn()} />)
    // Component should stay in loading state (null)
    await waitFor(() => {
      expect(screen.queryByText('Validation Results')).not.toBeInTheDocument()
    })
  })
})
