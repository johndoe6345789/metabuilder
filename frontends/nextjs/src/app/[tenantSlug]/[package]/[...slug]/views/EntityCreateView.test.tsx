import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntityCreateView } from './EntityCreateView'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

describe('EntityCreateView', () => {
  it('shows the POST API URL for the entity', () => {
    render(
      <EntityCreateView tenant="acme" pkg="blog" entity="Post" schema={null} />
    )
    expect(screen.getByText('POST /api/v1/acme/blog/Post')).toBeTruthy()
  })

  it('renders no field inputs when there is no schema', () => {
    render(
      <EntityCreateView tenant="acme" pkg="blog" entity="Post" schema={null} />
    )
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
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
    expect(screen.getByText('title').closest('label')?.textContent).toBe(
      'title*'
    )
    expect(screen.getByText('body').closest('label')?.textContent).toBe(
      'body'
    )
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
