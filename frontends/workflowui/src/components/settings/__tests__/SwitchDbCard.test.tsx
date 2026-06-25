/**
 * Tests for SwitchDbCard component
 */

jest.mock('../AdapterSelector', () => ({
  __esModule: true,
  default: ({ selectedAdapter, onAdapterChange }: any) => (
    <div data-testid="adapter-selector">
      <span>{selectedAdapter}</span>
      <button data-testid="change-adapter" onClick={() => onAdapterChange('mysql')}>Change</button>
    </div>
  ),
}))

jest.mock('../DbAdapterFields', () => ({
  __esModule: true,
  default: ({ formFields, onFieldChange }: any) => (
    <div data-testid="adapter-fields">
      <input
        data-testid="host-field"
        value={formFields.host || ''}
        onChange={(e) => onFieldChange('host', e.target.value)}
      />
    </div>
  ),
}))

jest.mock('../ConnectionResultAlerts', () => ({
  __esModule: true,
  default: ({ testResult, switchResult }: any) => (
    <div data-testid="connection-alerts">
      {testResult && <span data-testid="test-result">{testResult.message}</span>}
      {switchResult && <span data-testid="switch-result">{switchResult.message}</span>}
    </div>
  ),
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SwitchDbCard from '../SwitchDbCard'

const defaultProps = {
  selectedAdapter: 'sqlite',
  formFields: { host: 'localhost', port: '5432', database: 'mydb' },
  testing: false,
  switching: false,
  testResult: null,
  switchResult: null,
  defaultPorts: { postgres: '5432', mysql: '3306' },
  onAdapterChange: jest.fn(),
  onFieldChange: jest.fn(),
  onTestConnection: jest.fn(),
  onApply: jest.fn(),
}

describe('SwitchDbCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the card with title', () => {
    render(<SwitchDbCard {...defaultProps} />)
    expect(screen.getByTestId('switch-db-card')).toBeInTheDocument()
    expect(screen.getByText('Switch Database')).toBeInTheDocument()
  })

  it('should render AdapterSelector', () => {
    render(<SwitchDbCard {...defaultProps} />)
    expect(screen.getByTestId('adapter-selector')).toBeInTheDocument()
  })

  it('should render DbAdapterFields', () => {
    render(<SwitchDbCard {...defaultProps} />)
    expect(screen.getByTestId('adapter-fields')).toBeInTheDocument()
  })

  it('should render ConnectionResultAlerts', () => {
    render(<SwitchDbCard {...defaultProps} />)
    expect(screen.getByTestId('connection-alerts')).toBeInTheDocument()
  })

  it('should render Test Connection button', () => {
    render(<SwitchDbCard {...defaultProps} />)
    expect(screen.getByTestId('test-connection-btn')).toBeInTheDocument()
    expect(screen.getByText('Test Connection')).toBeInTheDocument()
  })

  it('should render Apply button', () => {
    render(<SwitchDbCard {...defaultProps} />)
    expect(screen.getByTestId('apply-db-btn')).toBeInTheDocument()
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('should show "Testing..." when testing is true', () => {
    render(<SwitchDbCard {...defaultProps} testing={true} />)
    expect(screen.getByText('Testing...')).toBeInTheDocument()
  })

  it('should show "Switching..." when switching is true', () => {
    render(<SwitchDbCard {...defaultProps} switching={true} />)
    expect(screen.getByText('Switching...')).toBeInTheDocument()
  })

  it('should call onTestConnection when Test button clicked', () => {
    const onTestConnection = jest.fn()
    render(<SwitchDbCard {...defaultProps} onTestConnection={onTestConnection} />)
    fireEvent.click(screen.getByTestId('test-connection-btn'))
    expect(onTestConnection).toHaveBeenCalled()
  })

  it('should call onApply when Apply button clicked', () => {
    const onApply = jest.fn()
    render(<SwitchDbCard {...defaultProps} onApply={onApply} />)
    fireEvent.click(screen.getByTestId('apply-db-btn'))
    expect(onApply).toHaveBeenCalled()
  })

  it('should pass testResult to ConnectionResultAlerts', () => {
    const testResult = { ok: true, message: 'Connected!' }
    render(<SwitchDbCard {...defaultProps} testResult={testResult} />)
    expect(screen.getByTestId('test-result')).toHaveTextContent('Connected!')
  })

  it('should pass switchResult to ConnectionResultAlerts', () => {
    const switchResult = { ok: false, message: 'Failed to switch' }
    render(<SwitchDbCard {...defaultProps} switchResult={switchResult} />)
    expect(screen.getByTestId('switch-result')).toHaveTextContent('Failed to switch')
  })

  it('should call onAdapterChange when adapter changed', () => {
    const onAdapterChange = jest.fn()
    render(<SwitchDbCard {...defaultProps} onAdapterChange={onAdapterChange} />)
    fireEvent.click(screen.getByTestId('change-adapter'))
    expect(onAdapterChange).toHaveBeenCalledWith('mysql')
  })
})
