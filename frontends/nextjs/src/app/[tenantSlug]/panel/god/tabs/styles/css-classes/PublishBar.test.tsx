import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { PublishBar } from './PublishBar'

describe('PublishBar', () => {
  it('shows the staged-changes state when dirty', () => {
    render(<PublishBar dirty publishing={false} onPublish={vi.fn()} />)
    expect(screen.getByText('Staged changes — not yet published')).toBeTruthy()
  })

  it('shows the published state when clean', () => {
    render(<PublishBar dirty={false} publishing={false} onPublish={vi.fn()} />)
    expect(screen.getByText('Published — up to date')).toBeTruthy()
  })

  it('disables the button when nothing is dirty', () => {
    render(<PublishBar dirty={false} publishing={false} onPublish={vi.fn()} />)
    const button = screen.getByText('⇧ Publish').closest('button')
    expect(button?.disabled).toBe(true)
  })

  it('disables the button while publishing', () => {
    render(<PublishBar dirty publishing onPublish={vi.fn()} />)
    const button = screen.getByText('Publishing…').closest('button')
    expect(button?.disabled).toBe(true)
  })

  it('calls onPublish when clicked', () => {
    const onPublish = vi.fn()
    render(<PublishBar dirty publishing={false} onPublish={onPublish} />)
    fireEvent.click(screen.getByText('⇧ Publish'))
    expect(onPublish).toHaveBeenCalledOnce()
  })
})
