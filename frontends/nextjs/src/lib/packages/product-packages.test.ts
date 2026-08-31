import { describe, it, expect } from 'vitest'
import {
  PRODUCT_PACKAGES,
  PRODUCT_TIERS,
  packageById,
  tierById,
  defaultComponentTree,
} from './product-packages'

describe('PRODUCT_PACKAGES', () => {
  it('has a unique id per package', () => {
    const ids = PRODUCT_PACKAGES.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every package at least one default route', () => {
    for (const pkg of PRODUCT_PACKAGES) {
      expect(pkg.defaultRoutes.length).toBeGreaterThan(0)
    }
  })
})

describe('PRODUCT_TIERS', () => {
  it('only references packages that actually exist', () => {
    const knownIds = new Set(PRODUCT_PACKAGES.map(p => p.id))
    for (const tier of PRODUCT_TIERS) {
      for (const id of tier.packageIds) {
        expect(knownIds.has(id)).toBe(true)
      }
    }
  })

  it('increases price with each tier', () => {
    const prices = PRODUCT_TIERS.map(t => t.price)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })
})

describe('packageById', () => {
  it('finds a package by id', () => {
    expect(packageById('pages')?.name).toBe('Pages')
  })

  it('returns undefined for an unknown id', () => {
    expect(packageById('nope')).toBeUndefined()
  })
})

describe('tierById', () => {
  it('finds a tier by id', () => {
    expect(tierById('starter')?.name).toBe('Starter')
  })

  it('returns undefined for an unknown id', () => {
    expect(tierById('nope' as never)).toBeUndefined()
  })
})

describe('defaultComponentTree', () => {
  it('names the page in the first heading', () => {
    const tree = defaultComponentTree('About Us') as {
      children: { children: { props: { content: string } }[] }[]
    }
    expect(tree.children[0]?.children[0]?.props.content).toBe('About Us')
  })
})
