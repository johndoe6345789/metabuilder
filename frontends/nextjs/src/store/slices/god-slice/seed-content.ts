import type { DropdownConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-dropdown-configs'
import type { TestCase } from '@/app/[tenantSlug]/panel/god/tabs/test/use-test-runner'
import type { Task } from '@/app/[tenantSlug]/panel/god/tabs/plan/use-plan-board'

export const SEED_DROPDOWNS: DropdownConfig[] = [
  {
    id: 'd_status',
    name: 'status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Archived', value: 'archived' },
    ],
  },
]

export const SEED_TESTS: TestCase[] = [
  {
    id: 't1',
    name: 'returns email',
    input: '{\n  "email": "a@b.com"\n}',
    expected: '{\n  "email": "a@b.com"\n}',
  },
]

export const SEED_PLAN: Task[] = [
  { id: 'p1', title: 'Design the landing page', status: 'todo' },
  { id: 'p2', title: 'Wire signup workflow', status: 'doing' },
]
