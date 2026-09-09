import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// The form writes now, so it is a client component with a router.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))
import { EntityCreateView } from './EntityCreateView'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

describe('EntityCreateView', () => {
  it('shows the POST API URL for the entity', () => {
    render(
      <EntityCreateView tenant="acme" pkg="blog" entity="Post" schema={null} />
    )
    expect(screen.getByText('POST /api/v1/acme/blog/Post')).toBeTruthy()
  })

  /**
   * With no schema there is nothing to derive a create form from -- so
   * it says that, rather than showing an empty form under a button that
   * would post an empty row.
   */
  it('explains itself when nothing says what fields the entity has', () => {
    render(
      <EntityCreateView tenant="acme" pkg="blog" entity="Post" schema={null} />
    )
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    expect(screen.getByText(/no package schema/)).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Create Post' })
    ).toHaveProperty('disabled', true)
  })

  // The button used to be a type="button" with no handler at all: a
  // filled-in form and an empty one did exactly the same nothing.
  it('offers a submit button, not an inert one', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string' }],
    }
    render(
      <EntityCreateView tenant="acme" pkg="blog" entity="Post" schema={schema} />
    )
    const button = screen.getByRole('button', { name: 'Create Post' })
    expect(button).toHaveProperty('type', 'submit')
    expect(button).toHaveProperty('disabled', false)
  })

  it('renders an input per schema field, with a * for required fields', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'body', type: 'string' },
      ],
    }
    render(
      <EntityCreateView tenant="acme" pkg="blog" entity="Post" schema={schema} />
    )
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    const labels = [...document.querySelectorAll('label')].map(
      l => l.textContent
    )
    expect(labels).toEqual(['title*', 'body'])
  })

  it('placeholders from the description, or "Enter <field>" without one', () => {
    const schema: EntitySchema = {
      name: 'Post',
      fields: [
        { name: 'title', type: 'string', description: 'A catchy title' },
        { name: 'body', type: 'string' },
      ],
    }
    render(
      <EntityCreateView tenant="acme" pkg="blog" entity="Post" schema={schema} />
    )
    expect(screen.getByPlaceholderText('A catchy title')).toBeTruthy()
    expect(screen.getByPlaceholderText('Enter body')).toBeTruthy()
  })
})
