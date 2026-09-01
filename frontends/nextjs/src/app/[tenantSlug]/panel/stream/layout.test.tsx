import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import StreamLayout from './layout'

describe('StreamLayout', () => {
  it('loads the Outfit font stylesheet', () => {
    const { container } = render(
      <StreamLayout>
        <div>stream content</div>
      </StreamLayout>
    )
    const link = container.querySelector('link[rel="stylesheet"]')
    expect(link?.getAttribute('href')).toContain('family=Outfit')
  })

  it('renders its children', () => {
    render(
      <StreamLayout>
        <div>stream content</div>
      </StreamLayout>
    )
    expect(screen.getByText('stream content')).toBeTruthy()
  })
})
