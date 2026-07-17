export interface ProductPackage {
  id: string
  name: string
  tagline: string
  icon: string
  color: string
  features: string[]
  defaultRoutes: Array<{ path: string; title: string }>
  category: 'core' | 'social' | 'members' | 'content' | 'comms' | 'analytics'
}

export interface ProductTier {
  id: 'starter' | 'creator' | 'studio'
  name: string
  price: number
  packageIds: string[]
  memberLimit: number | null
  highlight: boolean
  cta: string
}

export const PRODUCT_PACKAGES: ProductPackage[] = [
  {
    id: 'pages',
    name: 'Pages',
    tagline: 'Custom pages and landing pages',
    icon: 'web',
    color: '#6750A4',
    features: [
      'Custom homepage with hero section',
      'About, contact and legal pages',
      'Visual page builder — 241 components',
      'SEO-friendly meta tags per page',
    ],
    defaultRoutes: [
      { path: '/', title: 'Home' },
      { path: '/about', title: 'About' },
      { path: '/contact', title: 'Contact' },
    ],
    category: 'core',
  },
  {
    id: 'community',
    name: 'Community',
    tagline: 'Forums, chat and comments',
    icon: 'forum',
    color: '#0B6BCB',
    features: [
      'Discussion forums with threads',
      'Real-time chat rooms',
      'Comment threads on any page',
      'Member activity feed',
    ],
    defaultRoutes: [
      { path: '/community', title: 'Community' },
      { path: '/chat', title: 'Chat' },
    ],
    category: 'social',
  },
  {
    id: 'members',
    name: 'Members',
    tagline: 'Sign-up, profiles and access control',
    icon: 'group',
    color: '#197A3E',
    features: [
      'Member sign-up and login',
      'Profile pages and avatars',
      'Role-based access (public / member / admin)',
      'Private areas for paid members',
    ],
    defaultRoutes: [
      { path: '/members', title: 'Member Directory' },
      { path: '/profile', title: 'My Profile' },
    ],
    category: 'members',
  },
  {
    id: 'content',
    name: 'Content',
    tagline: 'Blog, news feed and media',
    icon: 'edit_note',
    color: '#B5410B',
    features: [
      'Blog with categories and tags',
      'Rich text and Markdown editor',
      'Media library and image uploads',
      'Auto-generated RSS feed',
    ],
    defaultRoutes: [
      { path: '/blog', title: 'Blog' },
      { path: '/media', title: 'Media' },
    ],
    category: 'content',
  },
  {
    id: 'email',
    name: 'Email',
    tagline: 'Newsletters and notifications',
    icon: 'mail',
    color: '#6B44B2',
    features: [
      'Email newsletters to your members',
      'Welcome and onboarding emails',
      'Customisable notification templates',
      'SMTP or managed delivery',
    ],
    defaultRoutes: [
      { path: '/newsletters', title: 'Newsletters' },
    ],
    category: 'comms',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    tagline: 'Traffic, growth and engagement stats',
    icon: 'bar_chart',
    color: '#1A7A9A',
    features: [
      'Page views and unique visitor counts',
      'Member growth over time',
      'Top content and engagement metrics',
      'CSV data export',
    ],
    defaultRoutes: [
      { path: '/analytics', title: 'Analytics' },
    ],
    category: 'analytics',
  },
]

export const PRODUCT_TIERS: ProductTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    packageIds: ['pages', 'community'],
    memberLimit: 200,
    highlight: false,
    cta: 'Start free trial',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 59,
    packageIds: ['pages', 'community', 'members', 'content'],
    memberLimit: 2000,
    highlight: true,
    cta: 'Start free trial',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 129,
    packageIds: ['pages', 'community', 'members', 'content', 'email', 'analytics'],
    memberLimit: null,
    highlight: false,
    cta: 'Start free trial',
  },
]

export function packageById(id: string): ProductPackage | undefined {
  return PRODUCT_PACKAGES.find(p => p.id === id)
}

export function tierById(id: string): ProductTier | undefined {
  return PRODUCT_TIERS.find(t => t.id === id)
}

export function defaultComponentTree(title: string): string {
  return JSON.stringify({
    type: 'Box',
    props: {},
    children: [
      {
        type: 'Typography',
        props: { variant: 'h4' },
        children: [{ type: 'text', props: { content: title } }],
      },
      {
        type: 'Typography',
        props: { variant: 'body1' },
        children: [{
          type: 'text',
          props: { content: 'Customise this page in the God Panel → Pages.' },
        }],
      },
    ],
  }, null, 2)
}
