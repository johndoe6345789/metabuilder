import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Text } from './Text'

describe('Text', () => {
  it.each([
    { variant: 'h1', weight: 'bold', children: 'Heading 1' },
    { variant: 'h2', weight: 'semibold', children: 'Heading 2' },
    { variant: 'body1', weight: 'regular', children: 'Body text' },
    { variant: 'body2', weight: 'light', children: 'Small text' },
    { variant: 'caption', weight: 'medium', children: 'Caption' },
  ] as const)('renders with variant=$variant weight=$weight', ({ variant, weight, children }) => {
    render(
      <Text variant={variant} weight={weight}>
        {children}
      </Text>
    )
    expect(screen.getByText(children)).not.toBeNull()
  })

  it.each([
    { align: 'left', children: 'Left aligned' },
    { align: 'center', children: 'Centered' },
    { align: 'right', children: 'Right aligned' },
  ] as const)('renders with align=$align', ({ align, children }) => {
    render(<Text align={align}>{children}</Text>)
    expect(screen.getByText(children)).not.toBeNull()
  })

  it('renders muted text', () => {
    render(<Text muted>Muted text</Text>)
    expect(screen.getByText('Muted text')).not.toBeNull()
  })

  it('renders truncated text', () => {
    render(<Text truncate>Very long text that should truncate</Text>)
    expect(screen.getByText('Very long text that should truncate')).not.toBeNull()
  })
})
