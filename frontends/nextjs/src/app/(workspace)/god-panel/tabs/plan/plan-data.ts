import type { ColumnDef, Priority } from './plan-types'

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']

export const COLUMNS: ColumnDef[] = [
  {
    status: 'todo',
    label: 'To do',
    hint: 'Ideas and unstarted work',
  },
  {
    status: 'doing',
    label: 'Doing',
    hint: 'Active implementation',
  },
  {
    status: 'done',
    label: 'Done',
    hint: 'Verified and ready',
  },
]
