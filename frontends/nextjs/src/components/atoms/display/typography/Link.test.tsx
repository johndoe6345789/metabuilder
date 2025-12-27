import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Link } from './Link'

describe('Link', () => {
  it.each([
    { href: '/about', external: false, children: 'About Us' },
    { href: '/contact', external: false, children: 'Contact' },
    { href: 'https://example.com', external: true, children: 'External Link' },
  ])('renders link with props %o', ({ href, external, children }) => {
    render(<Link href={href} external={external}>{children}</Link>)
    const link = screen.getByText(children)
    expect(link).not.toBeNull()
    expect(link.getAttribute('href')).not.toBeNull()
  })

  it('renders external link with correct attributes', () => {
    render(<Link href="https://example.com" external>External</Link>)
    const link = screen.getByText('External')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders internal link without target', () => {
    render(<Link href="/internal">Internal</Link>)
    const link = screen.getByText('Internal')
    expect(link.getAttribute('target')).toBeNull()
  })
})
