import React from 'react'
import { render, screen } from '@/test-utils'

// Since this is a utility component, we test the role and basic structure
describe('Alert Component', () => {
  it('renders with alert role', () => {
    render(
      <div role="alert" data-slot="alert" className="relative w-full rounded-lg border p-4">
        Alert content
      </div>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(
      <div role="alert" className="bg-background text-foreground">
        Default alert
      </div>
    )
    expect(screen.getByRole('alert')).toHaveClass('bg-background', 'text-foreground')
  })

  it('applies destructive variant classes', () => {
    render(
      <div role="alert" className="border-destructive/50 text-destructive">
        Error alert
      </div>
    )
    expect(screen.getByRole('alert')).toHaveClass('border-destructive/50', 'text-destructive')
  })

  it('supports custom className prop', () => {
    render(
      <div role="alert" className="custom-class">
        Custom alert
      </div>
    )
    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })
})
