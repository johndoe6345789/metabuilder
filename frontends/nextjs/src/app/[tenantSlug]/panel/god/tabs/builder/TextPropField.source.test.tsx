import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TextPropField } from './TextPropField'
import type { PropField } from '@/components/blocks/block-props'


describe('a field naming a Config-tab list (source)', () => {
  const iconField: PropField = {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    source: 'icons',
  }
  const configs = [
    {
      id: 'c1',
      name: 'icons',
      options: [
        { label: 'Bell', value: 'notifications' },
        { label: 'Home', value: 'home' },
      ],
    },
  ]

  it("offers the tenant's list as suggestions", () => {
    const { container } = render(
      <TextPropField
        field={iconField}
        current=""
        configs={configs}
        onChange={vi.fn()}
      />
    )
    const options = container.querySelectorAll('datalist option')
    expect([...options].map(o => o.getAttribute('value'))).toEqual([
      'notifications',
      'home',
    ])
  })

  it('still takes a value the list has never heard of', () => {
    const onChange = vi.fn()
    render(
      <TextPropField
        field={iconField}
        current=""
        configs={configs}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByLabelText('Icon'), {
      target: { value: 'rocket_launch' },
    })
    expect(onChange).toHaveBeenCalledWith({ icon: 'rocket_launch' })
  })

  it('renders no suggestion list when the tenant has not defined one', () => {
    const { container } = render(
      <TextPropField
        field={iconField}
        current=""
        configs={[]}
        onChange={vi.fn()}
      />
    )
    expect(container.querySelector('datalist')).toBeNull()
  })
})
