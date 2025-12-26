export type PermissionLevel = {
  id: number
  key: string
  title: string
  description: string
  badge: string
  capabilities: string[]
  tagline: string
}

export const PERMISSION_LEVELS: PermissionLevel[] = [
  {
    id: 1,
    key: 'guest',
    title: 'Guest',
    badge: '👁️',
    description: 'Browse the public landing pages and marketing content with read-only access.',
    tagline: 'View-only browsing with zero privileges.',
    capabilities: ['Access front page', 'Read public articles', 'View news feed'],
  },
  {
    id: 2,
    key: 'regular',
    title: 'Regular User',
    badge: '🧑‍💻',
    description: 'Interact with your profile, store preferences, and explore configurable dashboards.',
    tagline: 'Personalized space for regular contributors and team members.',
    capabilities: ['Edit personal settings', 'Update profile', 'Launch saved dashboards', 'Submit tickets'],
  },
  {
    id: 3,
    key: 'moderator',
    title: 'Moderator',
    badge: '🛡️',
    description: 'Keep the community healthy, triage issues, and enforce conduct policies.',
    tagline: 'Guardrails for the wider user base.',
    capabilities: ['Moderate discussions', 'Resolve user flags', 'Review reports', 'Approve content'],
  },
  {
    id: 4,
    key: 'god',
    title: 'God',
    badge: '🧙‍♂️',
    description: 'Design workflows, compose pages, and orchestrate the system architecture.',
    tagline: 'Blueprint builder with editing rights.',
    capabilities: ['Edit the front page', 'Author workflows', 'Define multi-tenant settings', 'Seed packages'],
  },
  {
    id: 5,
    key: 'supergod',
    title: 'Super God',
    badge: '👑',
    description: 'Full sovereignty over the universe: transfer rights, manage infrastructure, and override controls.',
    tagline: 'Ultimate authority for system-level changes.',
    capabilities: ['Assign god roles', 'Transfer front page rights', 'Burn/restore tenants', 'Run security audits'],
  },
]
