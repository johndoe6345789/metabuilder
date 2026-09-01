import { describe, expect, it } from 'vitest'
import { inferred } from './auto-props-infer'

describe('inferred', () => {
  it('humanises camelCase keys into label case', () => {
    const fields = inferred({ runWorkflow: true })
    expect(fields[0]?.label).toBe('Run workflow')
  })

  it('humanises a single lowercase key by capitalising it', () => {
    const fields = inferred({ src: 'a.png' })
    expect(fields[0]?.label).toBe('Src')
  })

  it('types a boolean default as boolean', () => {
    expect(inferred({ visible: true })[0]?.type).toBe('boolean')
  })

  it('types a number default as number', () => {
    expect(inferred({ count: 3 })[0]?.type).toBe('number')
  })

  it('types anything else as text', () => {
    expect(inferred({ title: 'Hello' })[0]?.type).toBe('text')
  })

  it('preserves insertion order and the raw key as name', () => {
    const fields = inferred({ b: 1, a: 2 })
    expect(fields.map(f => f.name)).toEqual(['b', 'a'])
  })
})
