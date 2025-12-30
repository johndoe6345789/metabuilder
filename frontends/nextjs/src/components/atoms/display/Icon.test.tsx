import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon, type IconName } from './Icon'

describe('Icon', () => {
  it.each([
    { name: 'Home', size: 'small' },
    { name: 'Settings', size: 'medium' },
    { name: 'Trash', size: 'large' },
    { name: 'Plus', size: 'inherit' },
  ] as const)('renders icon $name with size $size', ({ name, size }) => {
    const { container } = render(<Icon name={name} size={size} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('applies custom sx styles', () => {
    const { container } = render(<Icon name="Home" sx={{ color: 'blue' }} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('returns null for unknown icon', () => {
    const { container } = render(<Icon name={'UnknownIcon' as IconName} />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
