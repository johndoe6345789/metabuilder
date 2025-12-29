import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from './Icon'

describe('Icon', () => {
  it.each([
    { name: 'Home', size: 'small' },
    { name: 'Settings', size: 'medium' },
    { name: 'Delete', size: 'large' },
    { name: 'Add', size: 'inherit' },
  ] as const)('renders icon $name with size $size', ({ name, size }) => {
    const { container } = render(<Icon name={name} size={size} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('applies custom sx styles', () => {
    const { container } = render(<Icon name="Home" sx={{ color: 'primary.main' }} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('returns null for unknown icon', () => {
    const { container } = render(<Icon name={'UnknownIcon' as any} />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
