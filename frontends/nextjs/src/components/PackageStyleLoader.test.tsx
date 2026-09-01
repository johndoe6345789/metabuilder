import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { PackageStyleLoader } from './PackageStyleLoader'

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

beforeEach(() => {
  document.head.innerHTML = ''
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('PackageStyleLoader', () => {
  it('renders nothing', () => {
    mockFetch(async () => ({ ok: true, text: async () => '' }) as Response)
    const { container } = render(<PackageStyleLoader packages={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('injects a style tag with the fetched CSS', async () => {
    mockFetch(
      async () => ({ ok: true, text: async () => '.blog { color: red }' }) as Response
    )
    render(<PackageStyleLoader packages={['blog']} />)

    await waitFor(() => {
      const el = document.querySelector('style[data-pkg="blog"]')
      expect(el?.textContent).toBe('.blog { color: red }')
    })
  })

  it('updates an existing style tag instead of adding a second one', async () => {
    const existing = document.createElement('style')
    existing.setAttribute('data-pkg', 'blog')
    existing.textContent = 'old'
    document.head.appendChild(existing)

    mockFetch(
      async () => ({ ok: true, text: async () => 'new css' }) as Response
    )
    render(<PackageStyleLoader packages={['blog']} />)

    await waitFor(() => {
      expect(existing.textContent).toBe('new css')
    })
    expect(document.querySelectorAll('style[data-pkg="blog"]')).toHaveLength(1)
  })

  it('does not inject anything for a not-ok response', async () => {
    mockFetch(async () => ({ ok: false, status: 404 }) as Response)
    render(<PackageStyleLoader packages={['missing']} />)

    await new Promise(r => setTimeout(r, 10))
    expect(document.querySelector('style[data-pkg="missing"]')).toBeNull()
  })

  it('does not inject empty CSS', async () => {
    mockFetch(async () => ({ ok: true, text: async () => '   ' }) as Response)
    render(<PackageStyleLoader packages={['empty']} />)

    await new Promise(r => setTimeout(r, 10))
    expect(document.querySelector('style[data-pkg="empty"]')).toBeNull()
  })

  it('does not inject the "/* not found */" stub', async () => {
    mockFetch(
      async () => ({ ok: true, text: async () => '/* not found */' }) as Response
    )
    render(<PackageStyleLoader packages={['nope']} />)

    await new Promise(r => setTimeout(r, 10))
    expect(document.querySelector('style[data-pkg="nope"]')).toBeNull()
  })

  it('silently ignores a fetch failure', async () => {
    mockFetch(async () => {
      throw new Error('offline')
    })
    expect(() => render(<PackageStyleLoader packages={['x']} />)).not.toThrow()
    await new Promise(r => setTimeout(r, 10))
    expect(document.querySelector('style[data-pkg="x"]')).toBeNull()
  })

  it('loads a style tag for every package given', async () => {
    mockFetch(async () => ({ ok: true, text: async () => 'css' }) as Response)
    render(<PackageStyleLoader packages={['a', 'b']} />)

    await waitFor(() => {
      expect(document.querySelector('style[data-pkg="a"]')).not.toBeNull()
      expect(document.querySelector('style[data-pkg="b"]')).not.toBeNull()
    })
  })
})
