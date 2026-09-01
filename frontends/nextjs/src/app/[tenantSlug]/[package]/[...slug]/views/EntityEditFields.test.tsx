import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntityEditFields } from './EntityEditFields'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

describe('EntityEditFields', () => {
  it('renders one input per field, seeded from the record', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string' }],
    }
    render(<EntityEditFields schema={schema} record={{ title: 'Hello' }} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.defaultValue).toBe('Hello')
  })

  it('marks a required field with an asterisk', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string', required: true }],
    }
    render(<EntityEditFields schema={schema} record={{}} />)
    expect(screen.getByText('*')).toBeTruthy()
  })

  it('does not mark a non-required field', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string', required: false }],
    }
    render(<EntityEditFields schema={schema} record={{}} />)
    expect(screen.queryByText('*')).toBeNull()
  })

  it('defaults an empty value to a blank input', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string' }],
    }
    render(<EntityEditFields schema={schema} record={{}} />)
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
  })

  it('stringifies an object value into the input', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'meta', type: 'object' }],
    }
    render(<EntityEditFields schema={schema} record={{ meta: { a: 1 } }} />)
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
      '{"a":1}'
    )
  })

  it('uses the field description as a placeholder when given', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string', description: 'Post title' }],
    }
    render(<EntityEditFields schema={schema} record={{}} />)
    expect(screen.getByPlaceholderText('Post title')).toBeTruthy()
  })

  it('falls back to "Enter {field}" with no description', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string' }],
    }
    render(<EntityEditFields schema={schema} record={{}} />)
    expect(screen.getByPlaceholderText('Enter title')).toBeTruthy()
  })

  it('renders nothing with a null schema', () => {
    const { container } = render(
      <EntityEditFields schema={null} record={{ title: 'x' }} />
    )
    expect(container.querySelectorAll('input')).toHaveLength(0)
  })
})
