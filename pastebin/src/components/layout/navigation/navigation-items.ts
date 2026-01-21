import {
  Atom,
  FlowArrow,
  Gear,
  House,
  Layout,
  Sparkle,
} from '@phosphor-icons/react'

export const navigationItems = [
  { path: '/', label: 'Home', icon: House },
  { path: '/demo', label: 'Split-Screen Demo', icon: Sparkle },
  { path: '/atoms', label: 'Atoms', icon: Atom },
  { path: '/molecules', label: 'Molecules', icon: FlowArrow },
  { path: '/organisms', label: 'Organisms', icon: Layout },
  { path: '/templates', label: 'Templates', icon: Layout },
  { path: '/settings', label: 'Settings', icon: Gear },
]
