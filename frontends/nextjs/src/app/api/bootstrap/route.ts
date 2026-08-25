/**
 * Bootstrap API endpoint
 *
 * One-time setup to seed the database via the C++ DBAL REST API.
 * Uses plain fetch — no hooks, no getDBALClient.
 *
 * POST /api/bootstrap
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/middleware'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

const ENTITY_BASE = `${DBAL_URL}/system/core`

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_PACKAGES = [
  { packageId: 'package_manager', version: '1.0.0', enabled: true, config: '{"autoUpdate":false,"systemPackage":true,"uninstallProtection":true}' },
  { packageId: 'ui_header', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'ui_footer', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'ui_home', version: '1.0.0', enabled: true, config: '{"systemPackage":true,"defaultRoute":"/","publicAccess":true}' },
  { packageId: 'ui_auth', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'ui_login', version: '1.0.0', enabled: true, config: '{"systemPackage":true}' },
  { packageId: 'dashboard', version: '1.0.0', enabled: true, config: '{"systemPackage":true,"defaultRoute":"/"}' },
  { packageId: 'user_manager', version: '1.0.0', enabled: true, config: '{"systemPackage":true,"minLevel":4}' },
  { packageId: 'role_editor', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":4}' },
  { packageId: 'admin_dialog', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":4}' },
  { packageId: 'database_manager', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":5,"dangerousOperations":true}' },
  { packageId: 'schema_editor', version: '1.0.0', enabled: true, config: '{"systemPackage":false,"minLevel":5,"dangerousOperations":true}' },
]

const SEED_PAGE_CONFIGS = [
  { path: '/', title: 'MetaBuilder', description: 'Data-driven application platform', packageId: 'ui_home', component: 'home_page', level: 0, requiresAuth: false, isPublished: true, sortOrder: 0 },
  { path: '/dashboard', title: 'Dashboard', packageId: 'dashboard', component: 'dashboard_home', level: 1, requiresAuth: true, isPublished: true, sortOrder: 0 },
  { path: '/profile', title: 'User Profile', packageId: 'dashboard', component: 'user_profile', level: 1, requiresAuth: true, isPublished: true, sortOrder: 50 },
  { path: '/login', title: 'Login', packageId: 'ui_login', component: 'login_page', level: 0, requiresAuth: false, isPublished: true, sortOrder: 0 },
  { path: '/admin', title: 'Administration', packageId: 'admin_dialog', component: 'admin_panel', level: 4, requiresAuth: true, isPublished: true, sortOrder: 0 },
  { path: '/admin/users', title: 'User Management', packageId: 'user_manager', component: 'user_list', level: 4, requiresAuth: true, isPublished: true, sortOrder: 10 },
  { path: '/admin/roles', title: 'Role Editor', packageId: 'role_editor', component: 'role_editor', level: 4, requiresAuth: true, isPublished: true, sortOrder: 20 },
  { path: '/admin/database', title: 'Database Manager', packageId: 'database_manager', component: 'database_manager', level: 5, requiresAuth: true, isPublished: true, sortOrder: 30 },
  { path: '/admin/schema', title: 'Schema Editor', packageId: 'schema_editor', component: 'schema_editor', level: 5, requiresAuth: true, isPublished: true, sortOrder: 40 },
  { path: '/admin/packages', title: 'Package Manager', packageId: 'package_manager', component: 'package_list', level: 4, requiresAuth: true, isPublished: true, sortOrder: 50 },
]

const DEMO_SITE_TENANT = {
  id: 'demo-site',
  name: 'Demo Site',
  slug: 'demo-site',
  description: 'Interactive demo tenant for MetaBuilder',
  color: '#6750A4',
  icon: 'web',
  tenantId: 'demo-site',
}

/** The tree a demo page renders. Returned as a node, not a string: it is
 *  written to PageTreeNode/PageTreeProp rows, not stored as a document. */
function pageShell(template: Record<string, unknown>): Record<string, unknown> {
  return template.render as Record<string, unknown>
}

function stack(
  children: Record<string, unknown>[],
  props: Record<string, unknown> = {},
) {
  return { type: 'Stack', props, children }
}

function card(
  children: Record<string, unknown>[],
  props: Record<string, unknown> = {},
) {
  return { type: 'Card', props, children }
}

function paper(
  children: Record<string, unknown>[],
  props: Record<string, unknown> = {},
) {
  return { type: 'Paper', props, children }
}

function heading(text: string, variant: string = 'h4') {
  return { type: 'Typography', props: { variant }, children: [text] }
}

function body(text: string, variant: string = 'body1') {
  return { type: 'Typography', props: { variant }, children: [text] }
}

function button(label: string, href: string, variant: string = 'contained') {
  return {
    type: 'Button',
    props: { variant, href, component: 'a' },
    children: [label],
  }
}

function chip(label: string, color?: string) {
  return color === undefined
    ? { type: 'Chip', props: { label, size: 'small' }, children: [] }
    : { type: 'Chip', props: { label, size: 'small', color }, children: [] }
}

const DEMO_SITE_PAGE_CONFIGS = [
  {
    id: 'page_demo_site_home',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/',
    title: 'Demo Site',
    description: 'Interactive showcase site for MetaBuilder.',
    icon: 'web',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-home',
      name: 'DemoSiteHome',
      description: 'Home page for the demo tenant',
      render: paper([
        stack([
          heading('MetaBuilder Demo Site', 'h3'),
          body('A seeded tenant site with real navigation, forms, and content sections.'),
          stack([
            button('About', '/app/demo-site/about'),
            button('Services', '/app/demo-site/services', 'outlined'),
            button('Contact', '/app/demo-site/contact', 'outlined'),
          ], { direction: 'row', style: { gap: '0.75rem', flexWrap: 'wrap' } }),
          card([
            stack([
              heading('What is seeded', 'h6'),
              body('Eight connected pages under one tenant.'),
              body('Buttons, inputs, and links that render in the browser.'),
              body('A dashboard, FAQ, and a contact flow you can click through.'),
            ], { style: { gap: '0.75rem' } }),
          ], { style: { padding: '1rem' } }),
        ], { style: { gap: '1.25rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 0,
  },
  {
    id: 'page_demo_site_about',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/about',
    title: 'About the Demo Site',
    description: 'Overview of the seeded tenant experience.',
    icon: 'info',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-about',
      name: 'DemoSiteAbout',
      description: 'About page for the demo tenant',
      render: paper([
        stack([
          heading('About the Demo Site', 'h4'),
          stack([
            chip('Tenant', 'primary'),
            chip('DBAL-backed', 'success'),
            chip('Interactive', 'secondary'),
          ], { direction: 'row', style: { gap: '0.5rem', flexWrap: 'wrap' } }),
          card([
            stack([
              body('This site is seeded from DBAL records and rendered at runtime.'),
              body('The point is to exercise navigation, content, and form components instead of static marketing copy.'),
            ], { style: { gap: '0.75rem' } }),
          ], { style: { padding: '1rem' } }),
          button('Back home', '/app/demo-site', 'outlined'),
        ], { style: { gap: '1rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 10,
  },
  {
    id: 'page_demo_site_services',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/services',
    title: 'Services',
    description: 'Service overview for the demo tenant.',
    icon: 'build',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-services',
      name: 'DemoSiteServices',
      description: 'Service page for the demo tenant',
      render: paper([
        stack([
          heading('Services', 'h4'),
          body('Three common building blocks for a tenant site.'),
          stack([
            card([heading('Landing pages', 'h6'), body('Fast pages with clear calls to action.')], { style: { padding: '1rem', minWidth: '16rem' } }),
            card([heading('Lead capture', 'h6'), body('Forms that collect details and route users.')], { style: { padding: '1rem', minWidth: '16rem' } }),
            card([heading('Operations', 'h6'), body('Dashboards and admin surfaces for real work.')], { style: { padding: '1rem', minWidth: '16rem' } }),
          ], { direction: 'row', style: { gap: '1rem', flexWrap: 'wrap' } }),
          stack([
            button('Request a demo', '/app/demo-site/contact'),
            button('View pricing', '/app/demo-site/pricing', 'outlined'),
          ], { direction: 'row', style: { gap: '0.75rem', flexWrap: 'wrap' } }),
        ], { style: { gap: '1rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 20,
  },
  {
    id: 'page_demo_site_pricing',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/pricing',
    title: 'Pricing',
    description: 'Simple plan cards for the demo tenant.',
    icon: 'payments',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-pricing',
      name: 'DemoSitePricing',
      description: 'Pricing page for the demo tenant',
      render: paper([
        stack([
          heading('Pricing', 'h4'),
          body('Three plans to test card layouts and CTA buttons.'),
          stack([
            card([heading('Starter', 'h6'), body('Good for a single tenant site.'), body('$0 / month')], { style: { padding: '1rem', minWidth: '14rem' } }),
            card([heading('Pro', 'h6'), body('For active builders and editors.'), body('$25 / month')], { style: { padding: '1rem', minWidth: '14rem' } }),
            card([heading('Supergod', 'h6'), body('For cross-tenant control and operations.'), body('$75 / month')], { style: { padding: '1rem', minWidth: '14rem' } }),
          ], { direction: 'row', style: { gap: '1rem', flexWrap: 'wrap' } }),
          button('Start with Pro', '/app/demo-site/contact'),
        ], { style: { gap: '1rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 30,
  },
  {
    id: 'page_demo_site_contact',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/contact',
    title: 'Contact',
    description: 'Contact form and call to action.',
    icon: 'mail',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-contact',
      name: 'DemoSiteContact',
      description: 'Contact page for the demo tenant',
      render: paper([
        stack([
          heading('Contact', 'h4'),
          body('These fields render interactively so the page feels like a real site.'),
          stack([
            { type: 'TextField', props: { label: 'Name', fullWidth: true, placeholder: 'Your name' }, children: [] },
            { type: 'TextField', props: { label: 'Email', fullWidth: true, placeholder: 'you@example.com' }, children: [] },
            { type: 'TextField', props: { label: 'What are you building?', fullWidth: true, multiline: true, rows: 4 }, children: [] },
          ], { style: { gap: '1rem' } }),
          stack([
            button('Send inquiry', '/app/demo-site/thanks'),
            button('View FAQ', '/app/demo-site/faq', 'outlined'),
          ], { direction: 'row', style: { gap: '0.75rem', flexWrap: 'wrap' } }),
        ], { style: { gap: '1rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 40,
  },
  {
    id: 'page_demo_site_faq',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/faq',
    title: 'FAQ',
    description: 'Frequently asked questions.',
    icon: 'help',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-faq',
      name: 'DemoSiteFaq',
      description: 'FAQ page for the demo tenant',
      render: paper([
        stack([
          heading('FAQ', 'h4'),
          { type: 'List', props: {}, children: [
            { type: 'ListItem', props: {}, children: ['Can I edit pages? Yes, via the god panel page routes tab.'] },
            { type: 'ListItem', props: {}, children: ['Can I preview content? Yes, routes render from DBAL records.'] },
            { type: 'ListItem', props: {}, children: ['Can I build interactive sites? Yes, buttons, inputs, cards, and layout blocks all render.'] },
          ] },
          button('Open dashboard', '/app/demo-site/dashboard'),
        ], { style: { gap: '1rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 50,
  },
  {
    id: 'page_demo_site_dashboard',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Demo tenant dashboard surface.',
    icon: 'dashboard',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-dashboard',
      name: 'DemoSiteDashboard',
      description: 'Dashboard page for the demo tenant',
      render: paper([
        stack([
          heading('Dashboard', 'h4'),
          stack([
        card([heading('Pages', 'h6'), body('8 live pages')], { style: { padding: '1rem', minWidth: '10rem' } }),
            card([heading('Forms', 'h6'), body('2 input sections')], { style: { padding: '1rem', minWidth: '10rem' } }),
            card([heading('Actions', 'h6'), body('Multiple navigation targets')], { style: { padding: '1rem', minWidth: '10rem' } }),
          ], { direction: 'row', style: { gap: '1rem', flexWrap: 'wrap' } }),
          stack([
            button('Back home', '/app/demo-site'),
            button('Open contact', '/app/demo-site/contact', 'outlined'),
          ], { direction: 'row', style: { gap: '0.75rem', flexWrap: 'wrap' } }),
        ], { style: { gap: '1rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: true,
    isPublished: true,
    sortOrder: 60,
  },
  {
    id: 'page_demo_site_thanks',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/thanks',
    title: 'Thanks',
    description: 'Thank-you page after contact.',
    icon: 'check_circle',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-thanks',
      name: 'DemoSiteThanks',
      description: 'Thanks page for the demo tenant',
      render: paper([
        stack([
          heading('Thanks', 'h4'),
          body('The contact flow lands here so the button path is real.'),
          button('Return home', '/app/demo-site'),
        ], { style: { gap: '1rem' } }),
      ], { style: { padding: '2rem', borderRadius: '24px', maxWidth: '72rem', margin: '0 auto' } }),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 70,
  },
  {
    id: 'page_demo_site_builder_proof',
    tenantId: 'demo-site',
    packageId: 'god_builder',
    path: '/builder-proof',
    title: 'Builder Proof',
    description: 'A page rendered from the website builder tree format.',
    icon: 'construction',
    component: 'component_tree',
    tree: {
      id: 'root',
      type: 'container',
      props: { direction: 'column', gap: 14 },
      children: [
        {
          id: 'proof_heading',
          type: 'heading',
          props: { text: 'Website Builder Proof' },
          children: [],
        },
        {
          id: 'proof_intro',
          type: 'text',
          props: {
            text: 'This page uses the same block tree the god-panel builder publishes.',
          },
          children: [],
        },
        {
          id: 'proof_card',
          type: 'card',
          props: {},
          children: [
            {
              id: 'proof_card_text',
              type: 'text',
              props: {
                text: 'Cards, text, headings, and linked buttons render from DBAL.',
              },
              children: [],
            },
          ],
        },
        {
          id: 'proof_actions',
          type: 'container',
          props: { direction: 'row', gap: 12 },
          children: [
            {
              id: 'proof_contact',
              type: 'button',
              props: {
                label: 'Open contact',
                href: '/app/demo-site/contact',
              },
              children: [],
            },
            {
              id: 'proof_thanks',
              type: 'button',
              props: {
                label: 'Open thanks',
                href: '/app/demo-site/thanks',
                variant: 'outlined',
              },
              children: [],
            },
          ],
        },
      ],
    },
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 80,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function dbalDelete(entity: string, id: string): Promise<void> {
  await fetch(`${ENTITY_BASE}/${entity}/${id}`, { method: 'DELETE' }).catch(
    () => null
  )
}

/**
 * Write a page's tree as rows: one PageTree, one PageTreeNode per node, one
 * PageTreeProp per property. Deleting the PageTree first cascades its nodes
 * and properties away, so re-seeding replaces a tree rather than merging
 * into it. Returns the tree id to hang off PageConfig.pageTreeId.
 */
async function seedPageTree(
  pageId: string,
  title: string,
  root: Record<string, unknown>,
): Promise<string | null> {
  const treeId = `tree_${pageId}`
  await dbalDelete('PageTree', treeId)

  const stamp = Date.now()
  const created = await dbalPost('PageTree', {
    id: treeId,
    tenantId: 'system',
    name: title,
    description: `Seeded for ${pageId}`,
    createdAt: stamp,
    updatedAt: stamp,
  })
  if (!created.ok) return null

  let counter = 0
  const writeNode = async (
    node: Record<string, unknown>,
    parentId: string | null,
    order: number,
  ): Promise<boolean> => {
    counter += 1
    const rawId = node.id
    const nodeId = `${treeId}__${typeof rawId === 'string' && rawId.length > 0 ? rawId : `n${counter}`}`
    const nodeRes = await dbalPost('PageTreeNode', {
      id: nodeId,
      tenantId: 'system',
      treeId,
      parentId,
      type: typeof node.type === 'string' ? node.type : 'container',
      sortOrder: order,
    })
    if (!nodeRes.ok) return false

    const props = (node.props ?? {}) as Record<string, unknown>
    for (const [name, raw] of Object.entries(props)) {
      const valueType =
        typeof raw === 'boolean'
          ? 'boolean'
          : typeof raw === 'number'
            ? 'number'
            : 'string'
      const value =
        typeof raw === 'string' ? raw : raw == null ? '' : JSON.stringify(raw)
      const propRes = await dbalPost('PageTreeProp', {
        id: `${nodeId}__${name}`,
        tenantId: 'system',
        nodeId,
        treeId,
        name,
        value,
        valueType,
      })
      if (!propRes.ok) return false
    }

    const kids = (node.children ?? []) as Record<string, unknown>[]
    for (const [index, child] of kids.entries()) {
      if (!(await writeNode(child, nodeId, index))) return false
    }
    return true
  }

  return (await writeNode(root, null, 0)) ? treeId : null
}

async function dbalPost(
  entity: string,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`${ENTITY_BASE}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return { ok: res.ok, status: res.status }
}

async function dbalUpsert(
  entity: string,
  id: string,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; status: number }> {
  const post = await fetch(`${ENTITY_BASE}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (post.ok || post.status !== 409) {
    return { ok: post.ok, status: post.status }
  }

  const put = await fetch(`${ENTITY_BASE}/${entity}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return { ok: put.ok, status: put.status }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const limitResponse = applyRateLimit(request, 'bootstrap')
  if (limitResponse != null) {
    return limitResponse
  }

  const setupSecret = process.env.SETUP_SECRET
  const authHeader = request.headers.get('Authorization')
  if (
    setupSecret === undefined ||
    setupSecret.length === 0 ||
    authHeader !== `Bearer ${setupSecret}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { packages: 0, pages: 0, skipped: 0, errors: 0 }

  try {
    const tenantRes = await dbalUpsert('Tenant', DEMO_SITE_TENANT.id, DEMO_SITE_TENANT)
    if (tenantRes.ok) {
      results.pages++
      console.warn('[Seed] Created demo tenant: demo-site')
    } else if (tenantRes.status === 409) {
      results.skipped++
    } else {
      results.errors++
      console.warn(`[Seed] Failed to seed demo tenant: HTTP ${tenantRes.status}`)
    }
  } catch (error) {
    results.errors++
    console.warn('[Seed] Failed to seed demo tenant:', error instanceof Error ? error.message : error)
  }

  for (const page of DEMO_SITE_PAGE_CONFIGS) {
    try {
      const { tree, ...row } = page as Record<string, unknown> & {
        tree?: Record<string, unknown>
      }
      const treeId =
        tree === undefined
          ? null
          : await seedPageTree(
              String(row.id),
              String(row.title ?? row.path),
              tree,
            )
      const res = await dbalUpsert('PageConfig', page.id, {
        ...row,
        pageTreeId: treeId,
      })
      if (res.ok) {
        results.pages++
        console.warn(`[Seed] Upserted demo page: ${page.path}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(`[Seed] Failed to seed demo page ${page.path}: HTTP ${res.status}`)
      }
    } catch (error) {
      results.errors++
      console.warn(`[Seed] Failed to seed demo page ${page.path}:`, error instanceof Error ? error.message : error)
    }
  }

  // Seed InstalledPackage records
  for (const pkg of SEED_PACKAGES) {
    try {
      const res = await dbalPost('InstalledPackage', {
        ...pkg,
        installedAt: Math.floor(Date.now() / 1000),
      })
      if (res.ok) {
        results.packages++
        console.warn(`[Seed] Created package: ${pkg.packageId}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(`[Seed] Failed to seed package ${pkg.packageId}: HTTP ${res.status}`)
      }
    } catch (error) {
      results.errors++
      console.warn(`[Seed] Failed to seed package ${pkg.packageId}:`, error instanceof Error ? error.message : error)
    }
  }

  // Seed PageConfig records
  for (const page of SEED_PAGE_CONFIGS) {
    try {
      const res = await dbalPost('PageConfig', page)
      if (res.ok) {
        results.pages++
        console.warn(`[Seed] Created page: ${page.path}`)
      } else if (res.status === 409) {
        results.skipped++
      } else {
        results.errors++
        console.warn(`[Seed] Failed to seed page ${page.path}: HTTP ${res.status}`)
      }
    } catch (error) {
      results.errors++
      console.warn(`[Seed] Failed to seed page ${page.path}:`, error instanceof Error ? error.message : error)
    }
  }

  console.warn(`[Seed] Complete: ${results.packages} packages, ${results.pages} pages, ${results.skipped} skipped, ${results.errors} errors`)

  return NextResponse.json({
    success: true,
    message: 'Database seeded successfully',
    results,
  })
}
