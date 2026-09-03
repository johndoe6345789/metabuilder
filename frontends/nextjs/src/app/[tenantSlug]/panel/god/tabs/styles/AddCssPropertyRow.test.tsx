import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AddCssPropertyRow } from './AddCssPropertyRow'
import { CSS_PROPERTY_SUGGESTIONS } from './css-property-names'

describe('AddCssPropertyRow', () => {
  it('suggests common CSS properties via the property field\'s datalist', () => {
    render(<AddCssPropertyRow onSet={vi.fn()} />)
    const propertyInput = screen.getByLabelText(
      'property'
    ) as HTMLInputElement
    const list = document.getElementById(propertyInput.list?.id ?? '')
    expect(list).not.toBeNull()
    const optionValues = Array.from(list?.querySelectorAll('option') ?? []).map(
      o => o.value
    )
    expect(optionValues).toEqual(CSS_PROPERTY_SUGGESTIONS)
  })

  it('still allows typing a custom property not in the suggestion list', () => {
    const onSet = vi.fn()
    render(<AddCssPropertyRow onSet={onSet} />)
    fireEvent.change(screen.getByLabelText('property'), {
      target: { value: '--brand-color' },
    })
    fireEvent.change(screen.getByLabelText('value'), {
      target: { value: '#ff0000' },
    })
    fireEvent.click(screen.getByText('Add'))
    expect(onSet).toHaveBeenCalledWith('--brand-color', '#ff0000')
  })
})
