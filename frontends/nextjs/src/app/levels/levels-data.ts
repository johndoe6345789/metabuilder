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
    key: 'public',
    title: 'Public',
    badge: '🌍',
    description: 'Read-only access to marketing, help, and showcase pages without signing in.',
    tagline: 'Open browsing with zero authentication.',
    capabilities: ['Access the landing experience', 'Follow feature stories', 'Preview public dashboards'],
  },
  {
    id: 2,
    key: 'user',
    title: 'User',
    badge: '🧑‍💻',
    description: 'Personalized workspace for building content, saving dashboards, and collaborating.',
    tagline: 'Everyday contributors and team members.',
    capabilities: ['Edit personal settings', 'Manage own content', 'Launch saved dashboards', 'Join shared workflows'],
  },
  {
    id: 3,
    key: 'moderator',
    title: 'Moderator',
    badge: '🛡️',
    description: 'Protect the community by triaging flags, reviewing reports, and shaping shared spaces.',
    tagline: 'Guardians of behavior and tone.',
    capabilities: ['Moderate discussions', 'Resolve user flags', 'Review incident reports', 'Hide or restore content'],
  },
  {
    id: 4,
    key: 'admin',
    title: 'Admin',
    badge: '🧰',
    description: 'Tenant administrators who manage users, billing, policies, and broader content sets.',
    tagline: 'Operational control for the tenant layer.',
    capabilities: ['Manage user accounts', 'Adjust tenant settings', 'Approve packages', 'Oversee moderation queue'],
  },
  {
    id: 5,
    key: 'god',
    title: 'God',
    badge: '🧙‍♂️',
    description: 'Blueprint builders who orchestrate workflows, seed packages, and shape the system architecture.',
    tagline: 'Power users with advanced scripting rights.',
    capabilities: ['Author workflows', 'Compose the builder UI', 'Define multi-tenant templates', 'Seed packages'],
  },
  {
    id: 6,
    key: 'supergod',
    title: 'Super God',
    badge: '👑',
    description: 'Full sovereignty over every tenant, infrastructure, and override path in the universe.',
    tagline: 'Ultimate authority for platform-level change.',
    capabilities: ['Assign god roles', 'Transfer ownership', 'Burn and restore tenants', 'Run system-wide audits'],
  },
]
