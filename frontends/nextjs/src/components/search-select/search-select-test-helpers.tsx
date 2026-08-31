import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { installFetch } from '@/test/fetch-mock'
import { SearchSelect } from './SearchSelect'

export const rows = (...ids: string[]) => ({
  data: { data: ids.map(id => ({ id, name: `name-${id}` })) },
})

export const getLabel = (r: Record<string, unknown>) => String(r.name)

/** Renders SearchSelect wired to a mocked fetch -- shared across
 *  SearchSelect.test.tsx and its .choose split. */
export function setup(body: unknown = rows('a', 'b'), status = 200) {
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

export const focusInput = () => {
  const input = screen.getByPlaceholderText('Search…')
  fireEvent.focus(input)
  return input
}
