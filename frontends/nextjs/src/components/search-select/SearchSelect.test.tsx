import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { installFetch } from '@/test/fetch-mock'
import { SearchSelect } from './SearchSelect'

const rows = (...ids: string[]) => ({
  data: { data: ids.map(id => ({ id, name: `name-${id}` })) },
})

const getLabel = (r: Record<string, unknown>) => String(r.name)

function setup(body: unknown = rows('a', 'b'), status = 200) {
  const onSelect = vi.fn()
  const fetchMock = installFetch([{ match: '/', body, status }])
  render(
    <SearchSelect
      packageName="core"
      entity="Workflow"
      getLabel={getLabel}
      onSelect={onSelect}
    />
  )
  return { onSelect, ...fetchMock }
}

const focusInput = () => {
  const input = screen.getByPlaceholderText('Search…')
  fireEvent.focus(input)
  return input
}

describe('SearchSelect', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('opening', () => {
    it('browses without a query rather than showing nothing', async () => {
      const { calls } = setup()

      focusInput()

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      // The empty-query case must not hit _search, which needs a q.
      expect(calls[0]).not.toContain('_search')
      expect(calls[0]).toContain('limit=10')
    })

    it('lists what came back', async () => {
      setup()
      focusInput()

      await waitFor(() => {
        expect(screen.getByText('name-a')).toBeTruthy()
      })
      expect(screen.getByText('name-b')).toBeTruthy()
    })

    it('scopes the request to the given tenant, package and entity', async () => {
      const { calls } = setup()
      focusInput()

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      expect(calls[0]).toContain('/system/core/Workflow')
    })
  })

  describe('searching', () => {
    it('uses the search endpoint once a query is typed', async () => {
      const { calls } = setup()
      const input = focusInput()

      fireEvent.change(input, { target: { value: 'deploy' } })

      await waitFor(() => {
        expect(calls.some(c => c.includes('_search'))).toBe(true)
      })
      expect(calls.find(c => c.includes('_search'))).toContain('q=deploy')
    })
  })

  describe('choosing', () => {
    it('reports the chosen item to the caller', async () => {
      const { onSelect } = setup()
      focusInput()

      await waitFor(() => screen.getByText('name-a'))
      fireEvent.click(screen.getByText('name-a'))

      expect(onSelect).toHaveBeenCalledWith({ id: 'a', label: 'name-a' })
    })

    it('clears the list after choosing', async () => {
      const { onSelect } = setup()
      focusInput()

      await waitFor(() => screen.getByText('name-a'))
      fireEvent.click(screen.getByText('name-a'))

      await waitFor(() => {
        expect(screen.queryByText('name-b')).toBeNull()
      })
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('picks the highlighted item on Enter', async () => {
      const { onSelect } = setup()
      const input = focusInput()

      await waitFor(() => screen.getByText('name-a'))
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith({ id: 'b', label: 'name-b' })
    })

    it('does not run past the end of the list', async () => {
      const { onSelect } = setup()
      const input = focusInput()

      await waitFor(() => screen.getByText('name-a'))
      for (let i = 0; i < 5; i += 1) {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      }
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith({ id: 'b', label: 'name-b' })
    })

    it('does not run past the start of the list', async () => {
      const { onSelect } = setup()
      const input = focusInput()

      await waitFor(() => screen.getByText('name-a'))
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith({ id: 'a', label: 'name-a' })
    })
  })

  describe('when the request fails', () => {
    it('shows no results rather than stale ones on a non-ok response', async () => {
      const { calls } = setup({}, 500)
      focusInput()

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      expect(screen.queryByText('name-a')).toBeNull()
    })

    it('survives a malformed body', async () => {
      setup({ nonsense: true })
      focusInput()

      await waitFor(() => {
        expect(screen.queryByText('name-a')).toBeNull()
      })
    })
  })
})
