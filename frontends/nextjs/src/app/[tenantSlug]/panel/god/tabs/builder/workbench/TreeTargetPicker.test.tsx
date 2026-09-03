import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { TreeNode } from '../builder-registry'
import { TreeTargetPicker } from './TreeTargetPicker'

const tree: TreeNode = {
  id: 'root',
  type: 'container',
  props: {},
  children: [
    {
      id: 'hero',
      type: 'html.section',
      props: {},
      children: [{ id: 'h1', type: 'html.h1', props: {}, children: [] }],
    },
  ],
}

describe('TreeTargetPicker', () => {
  it('shows every node in the tree by its plain-language name', () => {
    render(<TreeTargetPicker node={tree} pickedId="root" onPick={vi.fn()} />)
    expect(screen.getByText('Container')).toBeTruthy()
    expect(screen.getByText('Section')).toBeTruthy()
    expect(screen.getByText('Heading 1')).toBeTruthy()
  })

  it('picks a node when its row is clicked', () => {
    const onPick = vi.fn()
    render(<TreeTargetPicker node={tree} pickedId="root" onPick={onPick} />)
    fireEvent.click(screen.getByText('Section'))
    expect(onPick).toHaveBeenCalledWith('hero')
  })

  it('picks a node on Enter, for keyboard use', () => {
    const onPick = vi.fn()
    render(<TreeTargetPicker node={tree} pickedId="root" onPick={onPick} />)
    fireEvent.keyDown(screen.getByText('Heading 1'), { key: 'Enter' })
    expect(onPick).toHaveBeenCalledWith('h1')
  })

  it('indents a child further than its parent', () => {
    render(<TreeTargetPicker node={tree} pickedId="root" onPick={vi.fn()} />)
    const rootPad = screen.getByText('Container').closest('[role="button"]')
    const heroPad = screen.getByText('Section').closest('[role="button"]')
    const rootLeft = Number(
      (rootPad as HTMLElement).style.paddingLeft.replace('px', '')
    )
    const heroLeft = Number(
      (heroPad as HTMLElement).style.paddingLeft.replace('px', '')
    )
    expect(heroLeft).toBeGreaterThan(rootLeft)
  })
})
