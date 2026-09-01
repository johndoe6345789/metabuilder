import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const dbMod = vi.hoisted(() => ({ loadPageFromDb: vi.fn() }))
vi.mock('@/lib/ui-pages/load-page-from-db', () => dbMod)

const rendererMod = vi.hoisted(() => ({
  UIPageRenderer: (props: { layout: unknown; actions: unknown }) => (
    <div data-testid="ui-page-renderer">{JSON.stringify(props.layout)}</div>
  ),
}))
vi.mock('@/components/ui-page-renderer/UIPageRenderer', () => rendererMod)

const navMod = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))
vi.mock('next/navigation', () => navMod)

import DynamicUIPage, {
  generateMetadata,
  generateStaticParams,
} from './page'

const paramsFor = (slug?: string[]) => ({ params: Promise.resolve({ slug }) })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DynamicUIPage', () => {
  it('calls notFound when no page data is found', async () => {
    dbMod.loadPageFromDb.mockResolvedValue(null)
    await expect(DynamicUIPage(paramsFor(['dashboard']))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
    expect(dbMod.loadPageFromDb).toHaveBeenCalledWith('/dashboard')
  })

  it('joins an empty slug into the root path', async () => {
    dbMod.loadPageFromDb.mockResolvedValue(null)
    await expect(DynamicUIPage(paramsFor(undefined))).rejects.toThrow()
    expect(dbMod.loadPageFromDb).toHaveBeenCalledWith('/')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an array', []],
  ])('calls notFound when componentTree is %s', async (_label, tree) => {
    dbMod.loadPageFromDb.mockResolvedValue({ title: 'X', componentTree: tree })
    await expect(DynamicUIPage(paramsFor(['x']))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
  })

  it('renders UIPageRenderer with the layout for a valid page', async () => {
    const componentTree = { type: 'div', children: [] }
    dbMod.loadPageFromDb.mockResolvedValue({ title: 'Dash', componentTree })
    const result = await DynamicUIPage(paramsFor(['dashboard']))
    render(result)
    expect(screen.getByTestId('ui-page-renderer').textContent).toBe(
      JSON.stringify(componentTree)
    )
  })
})

describe('generateMetadata', () => {
  it('returns a not-found title when no page data exists', async () => {
    dbMod.loadPageFromDb.mockResolvedValue(null)
    const meta = await generateMetadata(paramsFor(['missing']))
    expect(meta).toEqual({ title: 'Page Not Found' })
  })

  it('returns the page title and a derived description', async () => {
    dbMod.loadPageFromDb.mockResolvedValue({ title: 'Dashboard' })
    const meta = await generateMetadata(paramsFor(['dashboard']))
    expect(meta.title).toBe('Dashboard')
    expect(meta.description).toBe('MetaBuilder - Dashboard')
  })
})

describe('generateStaticParams', () => {
  it('returns an empty array', () => {
    expect(generateStaticParams()).toEqual([])
  })
})
