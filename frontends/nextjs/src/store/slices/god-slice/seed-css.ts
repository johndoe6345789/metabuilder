import type { CssClass } from '@/app/[tenantSlug]/panel/god/tabs/styles/use-css-classes'

/** The two starter classes every new God Panel project ships with. */
export const SEED_CSS: CssClass[] = [
  {
    id: 'c_card',
    name: 'card',
    props: {
      padding: '16px',
      borderRadius: '16px',
      background: '#161b22',
      border: '1px solid #30363d',
    },
  },
  {
    id: 'c_pill',
    name: 'pill',
    props: {
      padding: '4px 12px',
      borderRadius: '999px',
      background: '#1f6feb',
      color: '#fff',
      fontSize: '12px',
      fontWeight: '600',
    },
  },
]
