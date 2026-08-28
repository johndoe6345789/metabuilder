'use client'

/**
 * Canonical component-block registry + renderer.
 *
 * A component tree is `{ type, props, children }`. This module is the single
 * source of truth for which `type`s exist, how they render, and the palette
 * metadata — used by BOTH the god-panel builder (preview) and production pages
 * (UIPageRenderer), so a tree renders identically wherever it lives.
 *
 * Heavy blocks (MetaBuilder self-hosting tools, webchat) are lazy-loaded so
 * tenant pages only load them when needed.
 */

import dynamic from 'next/dynamic'
import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Skeleton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@/m3'
import { runWorkflow } from '@/lib/workflow/run-workflow'
import { store } from '@/store/store'
import type { RootState } from '@/store/store'

export interface TreeNode {
  id: string
  type: string
  props: Record<string, unknown>
  children: TreeNode[]
}

export type BlockCategory =
  | 'HTML'
  | 'Layout'
  | 'Content'
  | 'Inputs'
  | 'Feedback'
  | 'Community'
  | 'MetaBuilder'

export interface PaletteItem {
  type: string
  name: string
  icon: string
  category: BlockCategory
  container: boolean
  defaults: Record<string, unknown>
}

interface BlockDef {
  meta: PaletteItem
  render: (props: Record<string, unknown>, children: ReactNode) => ReactNode
}

// ── lazy heavy blocks ────────────────────────────────────────────────
const loading = () => <span style={{ opacity: 0.5 }}>Loading…</span>
const Webchat = dynamic(
  () =>
    import('@/components/webchat/Webchat').then(m => ({ default: m.Webchat })),
  { ssr: false, loading }
)
const WorkflowEditorBlock = dynamic(
  () =>
    import('@/app/[tenantSlug]/panel/god/blocks/metabuilder-blocks').then(
      m => ({ default: m.WorkflowEditorBlock })
    ),
  { ssr: false, loading }
)
const PackageManagerBlock = dynamic(
  () =>
    import('@/app/[tenantSlug]/panel/god/blocks/metabuilder-blocks').then(
      m => ({ default: m.PackageManagerBlock })
    ),
  { ssr: false, loading }
)
const SchemaEditorBlock = dynamic(
  () =>
    import('@/app/[tenantSlug]/panel/god/blocks/metabuilder-blocks').then(
      m => ({ default: m.SchemaEditorBlock })
    ),
  { ssr: false, loading }
)

// Fire the wired workflow when a bound button is clicked (route→tree→workflow).
function fireWorkflow(): void {
  const state = store.getState() as unknown as RootState
  const wf = state.god.workflow
  if (wf.nodes.length === 0) {
    window.alert('No workflow wired yet.')
    return
  }
  const res = runWorkflow(wf)
  window.alert(
    `Ran "${wf.name}"\n\n${res.logs.join('\n')}\n\n→ ${JSON.stringify(res.output)}`
  )
}

const m = (
  type: string,
  name: string,
  icon: string,
  category: BlockCategory,
  container: boolean,
  defaults: Record<string, unknown> = {}
): PaletteItem => ({ type, name, icon, category, container, defaults })

const propText = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? String(value)
    : fallback

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function propDirection(value: unknown): 'row' | 'column' {
  return value === 'row' ? 'row' : 'column'
}

function propGap(value: unknown): number {
  return typeof value === 'number' ? value : 12
}

function propNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback
}

function renderButton(p: Record<string, unknown>): ReactNode {
  const href = propText(p.href)
  const variant = propText(p.variant, 'contained')
  const runWorkflow = p.runWorkflow === true
  const buttonProps: Record<string, unknown> = {
    variant,
    onClick: runWorkflow
      ? () => {
          fireWorkflow()
        }
      : undefined,
  }

  if (href.length > 0) {
    buttonProps.href = href
    buttonProps.component = 'a'
  }

  return <Button {...buttonProps}>{propText(p.label, 'Button')}</Button>
}

const DEFS: BlockDef[] = [
  {
    meta: m('container', 'Container', 'grid_view', 'Layout', true, {
      direction: 'column',
      gap: 12,
    }),
    render: (p, kids) => {
      const style = isRecord(p.style) ? p.style : {}
      return (
        <div
          style={{
            ...style,
            display: 'flex',
            flexDirection: propDirection(p.direction),
            gap: propGap(p.gap),
          }}
        >
          {kids}
        </div>
      )
    },
  },
  {
    meta: m('card', 'Card', 'crop_square', 'Layout', true),
    render: (_p, kids) => <Card style={{ padding: 16 }}>{kids}</Card>,
  },
  {
    meta: m('grid', 'Grid', 'grid_on', 'Layout', true, { columns: 3, gap: 16 }),
    render: (p, kids) => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${propNumber(p.columns, 3)}, 1fr)`,
          gap: propGap(p.gap),
        }}
      >
        {kids}
      </div>
    ),
  },
  {
    meta: m('divider', 'Divider', 'horizontal_rule', 'Layout', false, {
      margin: 16,
    }),
    render: p => (
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--mat-sys-outline-variant, #30363d)',
          margin: `${propNumber(p.margin, 16)}px 0`,
        }}
      />
    ),
  },
  {
    meta: m('heading', 'Heading', 'title', 'Content', false, {
      text: 'Heading',
    }),
    render: p => (
      <Typography variant="h5">{propText(p.text, 'Heading')}</Typography>
    ),
  },
  {
    meta: m('text', 'Text', 'notes', 'Content', false, { text: 'Some text' }),
    render: p => <Typography variant="body1">{propText(p.text)}</Typography>,
  },
  {
    meta: m('image', 'Image', 'image', 'Content', false, {
      src: '',
      alt: '',
      radius: 0,
    }),
    render: p => {
      const src = propText(p.src)
      if (src.length === 0) return <em>Image: no src set</em>
      return (
        <img
          src={src}
          alt={propText(p.alt)}
          style={{
            maxWidth: '100%',
            borderRadius: propNumber(p.radius, 0),
          }}
        />
      )
    },
  },
  {
    meta: m('avatar', 'Avatar', 'account_circle', 'Content', false, {
      initials: 'U',
      size: 'md',
    }),
    render: p => {
      const size = propText(p.size, 'md')
      const src = propText(p.src)
      return (
        <Avatar
          src={src.length > 0 ? src : undefined}
          sm={size === 'sm'}
          md={size === 'md'}
          lg={size === 'lg'}
          xl={size === 'xl'}
        >
          {propText(p.initials, 'U')}
        </Avatar>
      )
    },
  },
  {
    meta: m('stat', 'Stat', 'monitoring', 'Content', false, {
      label: 'Members',
      value: '0',
    }),
    render: p => (
      <div>
        <Typography variant="h4">{propText(p.value, '0')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {propText(p.label, 'Label')}
        </Typography>
      </div>
    ),
  },
  {
    meta: m('list-item', 'List Item', 'list', 'Content', false, {
      icon: 'notifications',
      title: 'Title',
      description: 'Description',
    }),
    render: p => (
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span className="material-symbols-rounded" aria-hidden="true">
          {propText(p.icon, 'notifications')}
        </span>
        <div>
          <Typography variant="body1">{propText(p.title, 'Title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {propText(p.description)}
          </Typography>
        </div>
      </div>
    ),
  },
  {
    meta: m('button', 'Button', 'smart_button', 'Inputs', false, {
      label: 'Click me',
    }),
    render: renderButton,
  },
  {
    meta: m('pkg.webchat', 'Webchat', 'chat', 'Community', false, {
      channel: '#general',
    }),
    render: p => <Webchat channel={propText(p.channel, '#general')} />,
  },
  {
    meta: m(
      'mb.WorkflowEditor',
      'Workflow Editor',
      'account_tree',
      'MetaBuilder',
      false
    ),
    render: () => <WorkflowEditorBlock />,
  },
  {
    meta: m(
      'mb.PackageManager',
      'Package Manager',
      'deployed_code',
      'MetaBuilder',
      false
    ),
    render: () => <PackageManagerBlock />,
  },
  {
    meta: m('mb.SchemaEditor', 'Schema Editor', 'schema', 'MetaBuilder', false),
    render: () => <SchemaEditorBlock />,
  },
  // ---- HTML primitives -------------------------------------------------
  // The tree is meant to build whole pages, which needs the plain elements
  // as well as the styled ones.
  {
    meta: m('html.div', 'Div', 'check_box_outline_blank', 'HTML', true, {
      padding: 0,
    }),
    render: (p, kids) => (
      <div style={{ padding: propNumber(p.padding, 0) }}>{kids}</div>
    ),
  },
  {
    meta: m('html.section', 'Section', 'article', 'HTML', true, {}),
    render: (_p, kids) => <section>{kids}</section>,
  },
  {
    meta: m('html.span', 'Span', 'text_fields', 'HTML', false, {
      text: 'span',
    }),
    render: p => <span>{propText(p.text, 'span')}</span>,
  },
  {
    meta: m('html.p', 'Paragraph', 'notes', 'HTML', false, {
      text: 'Paragraph text.',
    }),
    render: p => <p>{propText(p.text, 'Paragraph text.')}</p>,
  },
  {
    meta: m('html.h1', 'H1', 'format_h1', 'HTML', false, { text: 'Heading 1' }),
    render: p => <h1>{propText(p.text, 'Heading 1')}</h1>,
  },
  {
    meta: m('html.h2', 'H2', 'format_h2', 'HTML', false, { text: 'Heading 2' }),
    render: p => <h2>{propText(p.text, 'Heading 2')}</h2>,
  },
  {
    meta: m('html.h3', 'H3', 'format_h3', 'HTML', false, { text: 'Heading 3' }),
    render: p => <h3>{propText(p.text, 'Heading 3')}</h3>,
  },
  {
    meta: m('html.ul', 'List (ul)', 'format_list_bulleted', 'HTML', true, {}),
    render: (_p, kids) => <ul>{kids}</ul>,
  },
  {
    meta: m('html.li', 'List item (li)', 'chevron_right', 'HTML', true, {
      text: 'Item',
    }),
    render: (p, kids) => (
      <li>
        {propText(p.text, 'Item')}
        {kids}
      </li>
    ),
  },
  {
    meta: m('html.a', 'Link', 'link', 'HTML', false, {
      text: 'Link',
      href: '#',
    }),
    render: p => <a href={propText(p.href, '#')}>{propText(p.text, 'Link')}</a>,
  },

  // ---- More of the existing component library --------------------------
  {
    meta: m('m3.paper', 'Paper', 'layers', 'Layout', true, { padding: 16 }),
    render: (p, kids) => (
      <Paper style={{ padding: propNumber(p.padding, 16) }}>{kids}</Paper>
    ),
  },
  {
    meta: m('m3.accordion', 'Accordion', 'expand_more', 'Layout', true, {
      title: 'Details',
    }),
    render: (p, kids) => (
      <Accordion>
        <AccordionSummary>{propText(p.title, 'Details')}</AccordionSummary>
        <AccordionDetails>{kids}</AccordionDetails>
      </Accordion>
    ),
  },
  {
    meta: m('m3.chip', 'Chip', 'label', 'Content', false, { label: 'Chip' }),
    render: p => <Chip label={propText(p.label, 'Chip')} size="small" />,
  },
  {
    meta: m('m3.badge', 'Badge', 'notifications', 'Content', true, {
      count: 1,
    }),
    render: (p, kids) => <Badge content={propNumber(p.count, 1)}>{kids}</Badge>,
  },
  {
    meta: m('m3.alert', 'Alert', 'info', 'Feedback', false, {
      severity: 'info',
      text: 'Something worth knowing.',
    }),
    render: p => (
      <Alert severity={propText(p.severity, 'info') as 'info'}>
        {propText(p.text, 'Something worth knowing.')}
      </Alert>
    ),
  },
  {
    meta: m('m3.progress', 'Progress bar', 'linear_scale', 'Feedback', false, {
      value: 40,
    }),
    render: p => (
      <LinearProgress variant="determinate" value={propNumber(p.value, 40)} />
    ),
  },
  {
    meta: m(
      'm3.spinner',
      'Spinner',
      'progress_activity',
      'Feedback',
      false,
      {}
    ),
    render: () => <CircularProgress />,
  },
  {
    meta: m('m3.skeleton', 'Skeleton', 'view_stream', 'Feedback', false, {
      height: 24,
    }),
    render: p => (
      <Skeleton variant="rectangular" height={propNumber(p.height, 24)} />
    ),
  },
  {
    meta: m('m3.tooltip', 'Tooltip', 'help', 'Feedback', true, {
      title: 'Explanation',
    }),
    render: (p, kids) => (
      <Tooltip title={propText(p.title, 'Explanation')}>
        <span>{kids}</span>
      </Tooltip>
    ),
  },
  {
    meta: m('m3.textfield', 'Text field', 'edit', 'Inputs', false, {
      label: 'Label',
      placeholder: '',
    }),
    render: p => (
      <TextField
        size="small"
        label={propText(p.label, 'Label')}
        placeholder={propText(p.placeholder)}
      />
    ),
  },
  {
    meta: m('m3.checkbox', 'Checkbox', 'check_box', 'Inputs', false, {
      label: 'Checkbox',
    }),
    render: p => (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Checkbox />
        {propText(p.label, 'Checkbox')}
      </label>
    ),
  },
  {
    meta: m('m3.switch', 'Switch', 'toggle_on', 'Inputs', false, {
      label: 'Switch',
    }),
    render: p => (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Switch />
        {propText(p.label, 'Switch')}
      </label>
    ),
  },
]

export const BLOCK_REGISTRY: Partial<Record<string, BlockDef>> =
  Object.fromEntries(DEFS.map(d => [d.meta.type, d]))

export const PALETTE: PaletteItem[] = DEFS.map(d => d.meta)

export function paletteItem(type: string): PaletteItem | undefined {
  return BLOCK_REGISTRY[type]?.meta
}

/**
 * Attributes every block accepts, whatever it renders: identity, styling and
 * accessibility. They are applied centrally in renderNode rather than by each
 * block, because a block's render() only reads the props it knows about -- so
 * without this, setting an id or aria-label in the builder would silently do
 * nothing on 37 different block types.
 */
export const COMMON_PROP_KEYS = [
  'id',
  'name',
  'className',
  'role',
  'tabIndex',
  'ariaLabel',
  'ariaDescribedby',
  'ariaHidden',
  'testId',
] as const

// Deliberately NOT here: `title`. Three blocks (list item, accordion,
// tooltip) already use props.title as their visible content, so injecting it
// as the DOM title attribute would hang a duplicate native tooltip off every
// existing one. aria-label covers the accessible-name case properly anyway.

/** Builder prop name -> real DOM attribute, where the two differ. */
const DOM_ATTR: Record<string, string> = {
  ariaLabel: 'aria-label',
  ariaDescribedby: 'aria-describedby',
  ariaHidden: 'aria-hidden',
  testId: 'data-testid',
}

function commonAttrs(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of COMMON_PROP_KEYS) {
    const raw = props[key]
    if (raw === undefined || raw === null || raw === '') continue
    const attr = DOM_ATTR[key] ?? key
    out[attr] = key === 'tabIndex' ? Number(raw) : raw
  }
  return out
}

/** Render a component-tree node (and its children) to React. Canonical. */
export function renderNode(node: TreeNode): ReactNode {
  const def = BLOCK_REGISTRY[node.type]
  const kids = node.children.map(c => (
    <span key={c.id} style={{ display: 'contents' }}>
      {renderNode(c)}
    </span>
  ))
  if (def === undefined) return <em>Unknown block: {node.type}</em>
  const el = def.render(node.props, kids)
  const attrs = commonAttrs(node.props)
  // Nothing set, or the block returned a fragment/string that cannot carry
  // attributes -- render it exactly as before.
  if (Object.keys(attrs).length === 0 || !isValidElement(el)) return el
  const existing = (el.props as { className?: unknown }).className
  const added = attrs.className
  if (
    typeof existing === 'string' &&
    existing !== '' &&
    typeof added === 'string'
  ) {
    // The block set its own class; the author's is additional, not a override.
    attrs.className = `${existing} ${added}`
  }
  return cloneElement(el as ReactElement<Record<string, unknown>>, attrs)
}
