import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const jsonRenderer = vi.hoisted(() => ({
  renderJSONComponent: vi.fn(() => <div data-testid="json">json</div>),
}))
const blockRegistry = vi.hoisted(() => ({
  renderNode: vi.fn(() => <div data-testid="tree">tree</div>),
}))
vi.mock('@/lib/packages/json/render-json-component', () => jsonRenderer)
vi.mock('@/components/blocks/block-registry', () => blockRegistry)

import {
  UIPageRenderer,
  useAction,
  useUIPageActions,
} from './UIPageRenderer'

function ActionsReader() {
  const ctx = useUIPageActions()
  const save = useAction('save')
  const missing = useAction('missing')
  return (
    <div data-testid="ctx">
      keys:{Object.keys(ctx).join(',')}|save:{String(save !== undefined)}
      |missing:{String(missing)}
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('UIPageRenderer', () => {
  it('renders via the component-tree path for a {type,children} layout', () => {
    render(<UIPageRenderer layout={{ type: 'div', children: [] } as never} />)
    expect(screen.getByTestId('tree')).toBeTruthy()
    expect(blockRegistry.renderNode).toHaveBeenCalled()
    expect(jsonRenderer.renderJSONComponent).not.toHaveBeenCalled()
  })

  it('renders via the JSON-component path for a {render:{template}} layout', () => {
    render(
      <UIPageRenderer
        layout={{ id: 'c1', name: 'C', render: { template: {} } } as never}
      />
    )
    expect(screen.getByTestId('json')).toBeTruthy()
    expect(jsonRenderer.renderJSONComponent).toHaveBeenCalled()
    expect(blockRegistry.renderNode).not.toHaveBeenCalled()
  })

  it('exposes the given actions to descendants of the rendered tree', () => {
    blockRegistry.renderNode.mockReturnValueOnce(<ActionsReader />)
    const save = vi.fn()
    render(
      <UIPageRenderer
        layout={{ type: 'div', children: [] } as never}
        actions={{ save }}
      />
    )
    const text = screen.getByTestId('ctx').textContent
    expect(text).toContain('keys:save')
    expect(text).toContain('save:true')
    expect(text).toContain('missing:undefined')
  })

  it('defaults to an empty actions object with no actions prop', () => {
    blockRegistry.renderNode.mockReturnValueOnce(<ActionsReader />)
    render(<UIPageRenderer layout={{ type: 'div', children: [] } as never} />)
    expect(screen.getByTestId('ctx').textContent).toContain('keys:|')
  })
})
