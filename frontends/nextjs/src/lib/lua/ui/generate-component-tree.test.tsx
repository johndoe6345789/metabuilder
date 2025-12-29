import { describe, it, expect } from 'bun:test'
import React from 'react'
import { generateComponentTree } from './generate-component-tree'
import type { LuaUIComponent } from './types/lua-ui-package'

describe('generateComponentTree', () => {
  it('should generate a simple Stack component', () => {
    const luaComponent: LuaUIComponent = {
      type: 'Stack',
      props: { spacing: 2, padding: 3 },
      children: [],
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBeDefined()
    expect(reactElement.props.spacing).toBe(2)
    expect(reactElement.props.padding).toBe(3)
  })

  it('should generate Typography with text content', () => {
    const luaComponent: LuaUIComponent = {
      type: 'Typography',
      props: { variant: 'h4', text: 'Hello World' },
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBeDefined()
    expect(reactElement.props.variant).toBe('h4')
    // text prop should be removed and not passed to component
    expect(reactElement.props.text).toBeUndefined()
  })

  it('should generate Button with text content', () => {
    const luaComponent: LuaUIComponent = {
      type: 'Button',
      props: { type: 'submit', text: 'Click Me' },
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBeDefined()
    expect(reactElement.props.type).toBe('submit')
    expect(reactElement.props.text).toBeUndefined()
  })

  it('should generate TextField for Input type', () => {
    const luaComponent: LuaUIComponent = {
      type: 'Input',
      props: { name: 'email', type: 'email', label: 'Email', required: true },
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBeDefined()
    expect(reactElement.props.name).toBe('email')
    expect(reactElement.props.type).toBe('email')
    expect(reactElement.props.label).toBe('Email')
    expect(reactElement.props.required).toBe(true)
  })

  it('should generate multiline TextField for TextArea type', () => {
    const luaComponent: LuaUIComponent = {
      type: 'TextArea',
      props: { name: 'message', label: 'Message', rows: 4 },
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBeDefined()
    expect(reactElement.props.name).toBe('message')
    expect(reactElement.props.multiline).toBe(true)
    expect(reactElement.props.rows).toBe(4)
  })

  it('should handle nested components with children', () => {
    const luaComponent: LuaUIComponent = {
      type: 'Stack',
      props: { spacing: 3 },
      children: [
        {
          type: 'Typography',
          props: { variant: 'h4', text: 'Title' },
        },
        {
          type: 'Button',
          props: { text: 'Action' },
        },
      ],
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBeDefined()
    expect(reactElement.props.children).toBeDefined()
    expect(Array.isArray(reactElement.props.children)).toBe(true)
    expect(reactElement.props.children).toHaveLength(2)
  })

  it('should handle unknown component types gracefully', () => {
    const luaComponent: LuaUIComponent = {
      type: 'UnknownComponent',
      props: {},
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBe('div')
    expect(reactElement.props.children).toContain('Unknown component: UnknownComponent')
  })

  it('should generate complex nested structure', () => {
    const luaComponent: LuaUIComponent = {
      type: 'Form',
      props: { id: 'test_form' },
      children: [
        {
          type: 'Input',
          props: { name: 'username', label: 'Username' },
        },
        {
          type: 'Input',
          props: { name: 'password', type: 'password', label: 'Password' },
        },
        {
          type: 'Button',
          props: { type: 'submit', text: 'Login' },
        },
      ],
    }

    const reactElement = generateComponentTree(luaComponent)

    expect(reactElement.type).toBe('form')
    expect(reactElement.props.id).toBe('test_form')
    expect(reactElement.props.children).toHaveLength(3)
  })
})
