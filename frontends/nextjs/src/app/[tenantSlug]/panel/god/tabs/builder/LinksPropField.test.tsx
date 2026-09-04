import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { LinksPropField } from './LinksPropField'
import type { PropField } from '@/components/blocks/block-props'

const field: PropField = {
  name: 'links',
  label: 'Links',
  type: 'links',
  hint: 'Collapses into a burger menu on narrow screens',
}

const setup = (current: unknown) => {
  const onChange = vi.fn()
  render(
    <LinksPropField field={field} current={current} onChange={onChange} />
  )
  return onChange
}

const boxes = () => screen.queryAllByRole('textbox') as HTMLInputElement[]

describe('LinksPropField', () => {
  it('shows a row per stored link, never the delimited line itself', () => {
    setup('Home->/|About->/about')
    const values = boxes().map(b => b.value)
    expect(values).toEqual(['Home', '/', 'About', '/about'])
  })

  it('renders no rows when there are no links yet', () => {
    setup('')
    expect(boxes()).toHaveLength(0)
  })

  it('writes back the stored format when a label is edited', () => {
    const onChange = setup('Home->/|About->/about')
    fireEvent.change(boxes()[2], { target: { value: 'Our story' } })
    expect(onChange).toHaveBeenCalledWith({
      links: 'Home->/|Our story->/about',
    })
  })

  it('writes back the stored format when a destination is edited', () => {
    const onChange = setup('Home->/')
    fireEvent.change(boxes()[1], { target: { value: '/home' } })
    expect(onChange).toHaveBeenCalledWith({ links: 'Home->/home' })
  })

  it('adds an empty row that survives until it is typed into', () => {
    const onChange = setup('Home->/')
    fireEvent.click(screen.getByText('+ Add link'))
    expect(onChange).toHaveBeenCalledWith({ links: 'Home->/' })
  })

  it('removes the row that was clicked, not the last one', () => {
    const onChange = setup('Home->/|About->/about|Contact->/contact')
    fireEvent.click(screen.getByLabelText('Remove About'))
    expect(onChange).toHaveBeenCalledWith({
      links: 'Home->/|Contact->/contact',
    })
  })

  it('shows the hint as guidance, not as syntax to copy', () => {
    setup('Home->/')
    expect(
      screen.getByText('Collapses into a burger menu on narrow screens')
    ).toBeTruthy()
  })
})
