import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntityEditActions } from './EntityEditActions'

describe('EntityEditActions', () => {
  it('renders a Save Changes button', () => {
    render(
      <EntityEditActions tenant="acme" pkg="blog" entity="Post" id="42" />
    )
    expect(screen.getByText('Save Changes')).toBeTruthy()
  })

  it('links Cancel back to the entity detail page', () => {
    render(
      <EntityEditActions tenant="acme" pkg="blog" entity="Post" id="42" />
    )
    const cancelLink = screen.getByText('Cancel').closest('a')
    expect(cancelLink?.getAttribute('href')).toBe('/acme/blog/Post/42')
  })

  it('builds the cancel link from the given tenant/pkg/entity/id', () => {
    render(
      <EntityEditActions
        tenant="other-tenant"
        pkg="shop"
        entity="Order"
        id="99"
      />
    )
    const cancelLink = screen.getByText('Cancel').closest('a')
    expect(cancelLink?.getAttribute('href')).toBe(
      '/other-tenant/shop/Order/99'
    )
  })
})
