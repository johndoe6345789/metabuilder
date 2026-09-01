import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PackageDependencies } from './PackageDependencies'

describe('PackageDependencies', () => {
  it('renders nothing with no dependencies', () => {
    const { container } = render(<PackageDependencies dependencies={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a chip per dependency', () => {
    render(<PackageDependencies dependencies={['pages', 'members']} />)
    expect(screen.getByText('pages')).toBeTruthy()
    expect(screen.getByText('members')).toBeTruthy()
  })
})
