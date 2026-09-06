/**
 * The steps DBAL can actually run.
 *
 * The editor's stock palette (NODE_TYPES, in the workflow-editor library)
 * offers about thirty node types -- Webhook, HTTP Request, Send Email,
 * Code, Slack -- and the DBAL daemon that runs workflows implements seven
 * entirely different ones. The two sets do not overlap at all, so every
 * workflow anyone built was unrunnable by construction: it saved, it
 * published, and nothing could ever execute it.
 *
 * This is the runnable set, named the way the rest of the God Panel names
 * things -- "Save a row", not `dbal.entity.create`. The `id` is the step
 * type the daemon dispatches on and has to match
 * dbal/production/src/workflow/steps/*.hpp exactly.
 *
 * The library holding the stock palette is a separate repo, mounted here
 * and gitignored, so this repo cannot change it. Substituting the palette
 * at the one place the God Panel reads it is the seam that does exist.
 */

import type { NodeType } from '@/workflow-editor'

/** Where a step's result is put, so a later step can read it. */
const OUTPUTS_HINT = 'outputs'

const step = (
  id: string,
  name: string,
  icon: string,
  category: string,
  color: string,
  description: string,
  defaultConfig: Record<string, unknown>
): NodeType => ({
  id,
  type: category,
  category,
  name,
  icon,
  color,
  description,
  inputs: ['main'],
  outputs: ['main'],
  defaultConfig,
})

export const RUNNABLE_CATEGORIES = {
  make: { id: 'make', name: 'Make a value', color: '#10b981' },
  rows: { id: 'rows', name: 'Rows', color: '#3b82f6' },
  note: { id: 'note', name: 'Notes', color: '#6b7280' },
}

/**
 * Every step here runs. Ordering comes from the arrows drawn between them,
 * so a step that needs an id must be wired after the step that makes one.
 *
 * A value made by an earlier step is read as `${name}`; the record that
 * triggered the workflow is `${event.<field>}` -- for a form, that means
 * `${event.data.<field>}`.
 */
export const RUNNABLE_STEPS: NodeType[] = [
  step(
    'dbal.uuid',
    'Make an id',
    'variable',
    'make',
    '#10b981',
    'A fresh unique id. Name it under Outputs, then use it as ${that name}.',
    { [OUTPUTS_HINT]: { id: 'new_id' } }
  ),
  step(
    'dbal.timestamp',
    'The time now',
    'clock',
    'make',
    '#10b981',
    'The current timestamp. Name it under Outputs to stamp a row with it.',
    { [OUTPUTS_HINT]: { ts: 'now' } }
  ),
  step(
    'dbal.var.set',
    'Remember a value',
    'variable',
    'make',
    '#10b981',
    'Keep a value under a name so later steps can read it as ${name}.',
    { name: '', value: '' }
  ),
  step(
    'dbal.entity.create',
    'Save a row',
    'file-output',
    'rows',
    '#3b82f6',
    'Write a new row. `data` names the columns; values may refer to ' +
      'earlier steps, e.g. ${new_id}, or to what triggered this, e.g. ' +
      '${event.data.name}.',
    { entity: '', data: {} }
  ),
  step(
    'dbal.entity.get',
    'Fetch a row',
    'file-input',
    'rows',
    '#3b82f6',
    'Read one row by its id.',
    { entity: '', id: '', [OUTPUTS_HINT]: { item: 'row' } }
  ),
  step(
    'dbal.entity.list',
    'Find rows',
    'search',
    'rows',
    '#3b82f6',
    'Read rows matching a filter.',
    { entity: '', filter: {}, limit: 50, [OUTPUTS_HINT]: { items: 'rows' } }
  ),
  step(
    'dbal.log',
    'Write a note to the log',
    'file-text',
    'note',
    '#6b7280',
    'Record a line in the server log. Useful for checking a workflow ran.',
    { message: '' }
  ),
]
