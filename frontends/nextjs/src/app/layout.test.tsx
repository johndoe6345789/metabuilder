import { Children, isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import RootLayout, { metadata, viewport } from './layout'

describe('metadata', () => {
  it('sets the default title and template', () => {
    expect(metadata.title).toEqual({
      default: 'MetaBuilder - Data-Driven Application Platform',
      template: '%s | MetaBuilder',
    })
  })

  it('lists metabuilder among its keywords', () => {
    expect(metadata.keywords).toContain('metabuilder')
  })
})

describe('viewport', () => {
  it('pins initial scale to 1 for device width', () => {
    expect(viewport.width).toBe('device-width')
    expect(viewport.initialScale).toBe(1)
  })

  it('declares light and dark theme colors', () => {
    const colors = viewport.themeColor
    expect(Array.isArray(colors)).toBe(true)
    if (Array.isArray(colors)) {
      expect(colors).toHaveLength(2)
      expect(colors[0].media).toContain('light')
      expect(colors[1].media).toContain('dark')
    }
  })
})

describe('RootLayout', () => {
  it('renders an <html> root containing <head> and <body>', () => {
    const tree = RootLayout({ children: <div>page content</div> })
    expect(tree.type).toBe('html')
    expect(tree.props.lang).toBe('en')
    const kids = Children.toArray(tree.props.children).filter(isValidElement)
    const types = kids.map(k => k.type)
    expect(types).toContain('head')
    expect(types).toContain('body')
  })

  it('wraps children in Providers inside the body', () => {
    const tree = RootLayout({ children: <div>page content</div> })
    const kids = Children.toArray(tree.props.children).filter(isValidElement)
    const body = kids.find(k => k.type === 'body')
    expect(body).toBeDefined()
    if (body !== undefined && isValidElement(body)) {
      const bodyProps = body.props as { children: React.ReactNode }
      const providers = bodyProps.children
      expect(isValidElement(providers)).toBe(true)
      if (isValidElement(providers)) {
        const providerProps = providers.props as {
          children: React.ReactNode
        }
        expect(providerProps.children).toEqual(<div>page content</div>)
      }
    }
  })
})
