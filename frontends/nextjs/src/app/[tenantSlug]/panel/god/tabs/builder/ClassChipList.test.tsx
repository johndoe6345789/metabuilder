import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { installFetch } from '@/test/fetch-mock'
import { ClassChipList } from './ClassChipList'
import type { CssClass } from '../styles/use-css-classes'

const css = (name: string): CssClass => ({ id: name, name, props: {} })
const many = Array.from({ length: 9 }, (_, i) => css(`class-${i}`))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ClassChipList', () => {
  it('shows a hint when the tenant has no classes yet', () => {
    render(
      <ClassChipList classes={[]} applied={[]} tenant="acme" onToggle={vi.fn()} />
    )
    expect(screen.getByText('No classes defined yet.')).toBeTruthy()
  })

  it('renders every class as a chip while the list is short', () => {
    render(
      <ClassChipList
        classes={[css('card'), css('pill')]}
        applied={['card']}
        tenant="acme"
        onToggle={vi.fn()}
      />
    )
    expect(screen.getByText('card')).toBeTruthy()
    expect(screen.getByText('pill')).toBeTruthy()
    expect(screen.queryByPlaceholderText('Find a style to add…')).toBeNull()
  })

  it('toggles a class by clicking its chip, no typing required', () => {
    const onToggle = vi.fn()
    render(
      <ClassChipList
        classes={[css('card')]}
        applied={[]}
        tenant="acme"
        onToggle={onToggle}
      />
    )
    fireEvent.click(screen.getByText('card'))
    expect(onToggle).toHaveBeenCalledWith('card')
  })

  it('switches to a search box once past the chip threshold', () => {
    installFetch([{ match: '/', body: { data: { data: [] } }, status: 200 }])
    render(
      <ClassChipList
        classes={many}
        applied={['class-0']}
        tenant="acme"
        onToggle={vi.fn()}
      />
    )
    expect(screen.getByPlaceholderText('Find a style to add…')).toBeTruthy()
    // Whatever is already applied stays visible as a chip regardless.
    expect(screen.getByText('class-0')).toBeTruthy()
  })
})
