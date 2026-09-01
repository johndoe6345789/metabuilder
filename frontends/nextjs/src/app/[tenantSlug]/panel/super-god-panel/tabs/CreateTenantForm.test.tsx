import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CreateTenantForm } from './CreateTenantForm'

describe('CreateTenantForm', () => {
  it('calls onCancel from the Cancel button', () => {
    const onCancel = vi.fn()
    render(<CreateTenantForm onCreate={vi.fn()} onCancel={onCancel} />)
    screen.getByText('Cancel').click()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('creates with the typed name and clears the field', () => {
    const onCreate = vi.fn()
    render(<CreateTenantForm onCreate={onCreate} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Tenant Name'), {
      target: { value: 'Acme' },
    })

    fireEvent.click(screen.getByText('Create'))

    expect(onCreate).toHaveBeenCalledWith('Acme')
    expect(screen.getByLabelText('Tenant Name')).toHaveProperty('value', '')
  })

  it('does nothing for a blank or whitespace-only name', () => {
    const onCreate = vi.fn()
    render(<CreateTenantForm onCreate={onCreate} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Tenant Name'), {
      target: { value: '   ' },
    })

    fireEvent.click(screen.getByText('Create'))

    expect(onCreate).not.toHaveBeenCalled()
  })
})
