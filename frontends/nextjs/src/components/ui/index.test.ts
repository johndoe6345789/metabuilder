import { describe, it, expect } from 'vitest'
import { Button, Card, Dialog, Select, Table, Tabs } from '@/components/ui'

describe('ui barrel exports', () => {
  it('exposes common UI components', () => {
    expect(Button).toBeDefined()
    expect(Card).toBeDefined()
    expect(Dialog).toBeDefined()
    expect(Select).toBeDefined()
    expect(Table).toBeDefined()
    expect(Tabs).toBeDefined()
  })
})
