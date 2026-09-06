import { vi } from 'vitest'

import type { TreeNode } from '../block-registry'

let nextId = 0

/** A tree node with a unique id, so two of the same block can coexist. */
export const node = (
  type: string,
  props: Record<string, unknown>,
  children: TreeNode[] = []
): TreeNode => {
  nextId += 1
  return { id: `${type}-${nextId}`, type, props, children }
}

/** A booking form: two named fields and a submit button, inside a Form. */
export const bookingForm = (): TreeNode =>
  node('form', { formName: 'book-a-repair' }, [
    node('m3.textfield', { label: 'Your name', name: 'name' }),
    node('m3.textfield', { label: 'What needs doing', name: 'job' }),
    node('button', { label: 'Book a repair' }),
  ])

export const navMock = () => ({
  usePathname: vi.fn(() => '/harbour_cycle_works/book'),
})
