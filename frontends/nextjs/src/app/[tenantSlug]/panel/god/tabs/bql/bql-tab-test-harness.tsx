import { vi, type Mock } from 'vitest'

export const node = { id: 'root', type: 'container', props: {}, children: [] }

export const script = (
  id: string,
  name: string,
  text = 'add a Heading 1'
) => ({ id, name, text })

export const twoScripts = () => ({
  scripts: [script('a', 'Page content'), script('b', 'Routes')],
})

/**
 * The hook's shape with only what a test cares about overridden. The mock
 * itself stays in each test file: vi.hoisted values cannot be exported.
 */
export const stubWith = (
  useBqlTab: Mock,
  over: Record<string, unknown> = {}
) => {
  const value = {
    scripts: [script('a', 'Page content')],
    results: {},
    published: {},
    runningId: null,
    add: vi.fn(),
    remove: vi.fn(),
    patch: vi.fn(),
    run: vi.fn(),
    ...over,
  }
  useBqlTab.mockReturnValue(value)
  return value
}
