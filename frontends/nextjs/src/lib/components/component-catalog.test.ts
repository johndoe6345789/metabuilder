import { describe, expect, it } from 'vitest'
import { componentCatalog } from './component-catalog'
import { dataComponents } from './catalog/data'
import { displayComponents } from './catalog/display'
import { feedbackComponents } from './catalog/feedback'
import { inputComponents } from './catalog/inputs'
import { layoutComponents } from './catalog/layout'
import { typographyComponents } from './catalog/typography'

const catalogSections = [
  { name: 'layout', category: 'Layout', components: layoutComponents },
  { name: 'display', category: 'Display', components: displayComponents },
  { name: 'inputs', category: 'Input', components: inputComponents },
  { name: 'typography', category: 'Typography', components: typographyComponents },
  { name: 'feedback', category: 'Feedback', components: feedbackComponents },
  { name: 'data', category: 'Data', components: dataComponents },
] as const

describe('component catalog composition', () => {
  it('includes every component from each section in order', () => {
    const sectionTypes = catalogSections.flatMap(section =>
      section.components.map(component => component.type)
    )

    expect(componentCatalog).toHaveLength(sectionTypes.length)
    expect(componentCatalog.map(component => component.type)).toEqual(sectionTypes)
  })

  it('keeps components grouped under the correct category', () => {
    catalogSections.forEach(section => {
      section.components.forEach(component => {
        expect(component.category).toBe(section.category)
      })
    })
  })
})
