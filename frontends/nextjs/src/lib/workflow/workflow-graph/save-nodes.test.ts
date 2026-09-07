import { beforeEach, describe, expect, it, vi } from 'vitest'

import { saveNodes } from './save-nodes'

interface Row {
  id?: string
  nodeKey?: string
  nodeId?: string
  name?: string
  type?: string
  value?: string
  valueType?: string
  positionX?: number
  positionY?: number
}

const nodeRows: Row[] = []
const paramRows: Row[] = []

beforeEach(() => {
  nodeRows.length = 0
  paramRows.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const row = JSON.parse(String(init?.body)) as Row
      if (String(url).endsWith('WorkflowNodeParam')) paramRows.push(row)
      else nodeRows.push(row)
      return { ok: true } as Response
    })
  )
})

const step = () => ({
  id: 'n1',
  type: 'page.message',
  name: 'Say something',
  position: { x: 120, y: 240 },
  config: { text: 'Hello.' },
  inputs: ['main'],
  outputs: ['main'],
})

/**
 * A step's parameters are what it does: page.message with no `text` is a
 * step that throws, and dbal.log with no `message` logs nothing.
 *
 * This read `node.parameters` and a `[number, number]` position, which is
 * the shape of a row coming back out of DBAL. What it is actually handed
 * is the editor's own WorkflowNode -- `config`, and a {x, y} position --
 * through a double-unknown cast. So no workflow ever published from the
 * panel had a single parameter row written, and every node landed at
 * 0,0. Nothing said so: the writes all succeeded, and a step with no
 * parameters fails later, inside the daemon, on somebody's click.
 */
describe('saveNodes', () => {
  it("writes the step's parameters", async () => {
    expect(await saveNodes('http://d', 't', 'wf1', [step()])).toBe(true)

    expect(paramRows).toHaveLength(1)
    expect(paramRows[0]).toMatchObject({
      name: 'text',
      value: 'Hello.',
      nodeId: 'wf1__n1',
    })
  })

  it('keeps where the step was put', async () => {
    await saveNodes('http://d', 't', 'wf1', [step()])

    expect(nodeRows[0]).toMatchObject({ positionX: 120, positionY: 240 })
  })

  it('still writes the node itself', async () => {
    await saveNodes('http://d', 't', 'wf1', [step()])

    expect(nodeRows[0]).toMatchObject({
      nodeKey: 'n1',
      type: 'page.message',
      name: 'Say something',
    })
  })

  // sortOrder is `required` in the schema *and* carries a default of 0,
  // and DBAL validates presence before applying defaults -- so omitting
  // it is a 422 saying "Field is required" for a field that has one.
  it('numbers the parameters it writes', async () => {
    const two = { ...step(), config: { target: '.x', text: 'Hi' } }
    await saveNodes('http://d', 't', 'wf1', [two])

    expect(paramRows.map(r => (r as { sortOrder?: number }).sortOrder)).toEqual(
      [0, 1]
    )
  })

  it('writes a step that takes no parameters', async () => {
    const bare = { ...step(), config: {} }
    expect(await saveNodes('http://d', 't', 'wf1', [bare])).toBe(true)

    expect(paramRows).toHaveLength(0)
  })
})
