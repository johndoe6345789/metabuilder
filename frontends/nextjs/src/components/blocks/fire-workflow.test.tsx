import { beforeEach, describe, expect, it, vi } from 'vitest'

const storeMod = vi.hoisted(() => ({ store: { getState: vi.fn() } }))
vi.mock('@/store/store', () => storeMod)

const runner = vi.hoisted(() => ({ runWorkflow: vi.fn() }))
vi.mock('@/lib/workflow/run-workflow', () => runner)

import { fireWorkflow } from './fire-workflow'

const wf = (id: string, name: string) => ({
  workflow: { id, name, nodes: [{ id: 'n1' }], connections: [] },
  trigger: '',
  formName: '',
})

const alerted = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('alert', alerted)
  // The full RunResult shape: a mock missing `rows` or `effects` is the
  // test disagreeing with the only caller, not the code being fragile.
  runner.runWorkflow.mockReturnValue({
    logs: [],
    output: {},
    order: [],
    effects: [],
    rows: {},
    stopped: null,
  })
})

/**
 * The preview took the first workflow across *every* tenant held in this
 * browser, on the stated grounds that it had no tenant to consult. It has
 * one: the block is rendering on a page under /{tenant}/..., which is
 * where the form block reads its own from.
 *
 * So a founder pressing Preview could be shown another community's
 * workflow by name, with its logs and its output -- and even within their
 * own, whichever workflow happened to be first rather than the one open
 * in the editor.
 */
describe('previewing the draft workflow', () => {
  it('runs this community’s, not whichever browser tab was first', () => {
    storeMod.store.getState.mockReturnValue({
      god: {
        workflows: {
          harbour_cycle_works: [wf('w1', 'Someone else’s')],
          acme: [wf('w2', 'Ours')],
        },
        workflowSelected: {},
      },
    })

    fireWorkflow('acme')

    expect(runner.runWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ours' })
    )
    expect(String(alerted.mock.calls[0]?.[0])).not.toContain('Someone else')
  })

  it('runs the one open in the editor, not simply the first', () => {
    storeMod.store.getState.mockReturnValue({
      god: {
        workflows: { acme: [wf('w1', 'First'), wf('w2', 'Open')] },
        workflowSelected: { acme: 'w2' },
      },
    })

    fireWorkflow('acme')

    expect(runner.runWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Open' })
    )
  })

  it('says so when this community has none', () => {
    storeMod.store.getState.mockReturnValue({
      god: { workflows: { harbour_cycle_works: [wf('w1', 'Theirs')] } },
    })

    fireWorkflow('acme')

    expect(runner.runWorkflow).not.toHaveBeenCalled()
    expect(alerted).toHaveBeenCalledWith('No workflow wired yet.')
  })
})
