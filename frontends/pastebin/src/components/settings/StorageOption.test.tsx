import React from 'react'
import { render, screen } from '@testing-library/react'
import { StorageOption } from './StorageOption'

jest.mock('@metabuilder/components/m3', () => ({
  Radio: ({ id, value, checked, disabled, onChange }: any) => (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      data-testid={`radio-${id}`}
    />
  ),
  FormLabel: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
  FormControlLabel: ({ value, control, label }: any) => (
    <div data-value={value}>
      {control}
      {label}
    </div>
  ),
}))

describe('StorageOption', () => {
  const defaultProps = {
    id: 'storage-indexeddb',
    value: 'indexeddb' as const,
    checked: false,
    disabled: false,
    label: 'IndexedDB',
    desc: 'Store locally in browser',
    labelClass: 'active',
  }

  it('renders the label text', () => {
    render(<StorageOption {...defaultProps} />)
    expect(screen.getByText('IndexedDB')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<StorageOption {...defaultProps} />)
    expect(screen.getByText('Store locally in browser')).toBeInTheDocument()
  })

  it('renders radio input with correct id', () => {
    render(<StorageOption {...defaultProps} />)
    expect(screen.getByTestId('radio-storage-indexeddb')).toBeInTheDocument()
  })

  it('radio is checked when checked prop is true', () => {
    render(<StorageOption {...defaultProps} checked={true} />)
    const radio = screen.getByTestId(
      'radio-storage-indexeddb',
    ) as HTMLInputElement
    expect(radio.checked).toBe(true)
  })

  it('radio is unchecked when checked prop is false', () => {
    render(<StorageOption {...defaultProps} checked={false} />)
    const radio = screen.getByTestId(
      'radio-storage-indexeddb',
    ) as HTMLInputElement
    expect(radio.checked).toBe(false)
  })

  it('radio is disabled when disabled prop is true', () => {
    render(<StorageOption {...defaultProps} disabled={true} />)
    const radio = screen.getByTestId(
      'radio-storage-indexeddb',
    ) as HTMLInputElement
    expect(radio.disabled).toBe(true)
  })

  it('radio is enabled when disabled prop is false', () => {
    render(<StorageOption {...defaultProps} disabled={false} />)
    const radio = screen.getByTestId(
      'radio-storage-indexeddb',
    ) as HTMLInputElement
    expect(radio.disabled).toBe(false)
  })

  it('label links to radio via htmlFor', () => {
    render(<StorageOption {...defaultProps} />)
    const label = screen.getByText('IndexedDB').closest('label')
    expect(label).toHaveAttribute('for', 'storage-indexeddb')
  })

  it('renders with dbal value', () => {
    render(
      <StorageOption
        {...defaultProps}
        id="storage-dbal"
        value="dbal"
        label="DBAL"
        desc="Remote server"
      />,
    )
    expect(screen.getByText('DBAL')).toBeInTheDocument()
    expect(screen.getByText('Remote server')).toBeInTheDocument()
  })
})
