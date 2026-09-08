/**
 * A stand-in for the data layer, for the published-page journey.
 *
 * The server components that render a published page fetch DBAL from the
 * Node process, and Playwright's page.route only reaches requests the
 * browser makes -- so those calls cannot be mocked from a spec. Without
 * something answering them, nothing about server rendering, page access
 * or metadata can be tested end to end, which is how a founder's home page
 * came to send an empty document with the wrong title.
 *
 * Fixtures live in one place (`WORLD`) so a spec reads as a journey rather
 * than a pile of route handlers. Started by playwright.config.ts on 8099
 * and pointed at with DBAL_ENDPOINT, which the server side reads first --
 * the browser keeps talking to 8080, where page.route can still intercept.
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.DBAL_STUB_PORT ?? 8099)

const node = (id, type, props, children = []) => ({
  id,
  type,
  props,
  children,
})

/** Rows keyed by tenant, in the shape DBAL's envelope carries them. */
const WORLD = {
  harbour_cycle_works: {
    pages: [
      {
        id: 'p_home',
        path: '/',
        title: 'Harbour Cycle Works',
        description: 'Repairs and restorations in Bristol',
        isPublished: true,
        isActive: true,
        level: 0,
        pageTreeId: 'tree_home',
      },
      {
        id: 'p_minutes',
        path: '/minutes',
        title: 'Board minutes',
        description: 'Internal',
        isPublished: true,
        isActive: true,
        // "Admin only" in the founder-facing picker. Sent as a string on
        // purpose: the SQLite adapter emits one for an integer column, and
        // reading it as a number was what let this gate at zero.
        level: '3',
        pageTreeId: 'tree_minutes',
      },
    ],
    trees: {
      tree_home: node('root', 'container', {}, [
        node('title', 'heading', { text: 'Harbour Cycle Works' }),
        node('blurb', 'text', { text: 'Wheel building since 1994.' }),
      ]),
      tree_minutes: node('root', 'container', {}, [
        node('secret', 'text', { text: 'Committee pay review' }),
      ]),
    },
  },
  // A community that has signed up and published nothing.
  quiet_harbour: { pages: [], trees: {} },
}

const envelope = rows => JSON.stringify({ data: { data: rows } })

/** PageTreeNode/PageTreeProp rows for one tree, as loadTree expects. */
function treeRows(tenant, treeId, entity) {
  const root = WORLD[tenant]?.trees[treeId]
  if (root === undefined) return []
  const nodes = []
  const props = []
  const walk = (n, parentId, order) => {
    const id = `${treeId}__${n.id}`
    nodes.push({ id, treeId, parentId, type: n.type, sortOrder: order })
    Object.entries(n.props).forEach(([name, value], i) => {
      props.push({ nodeId: id, name, value: String(value), sortOrder: i })
    })
    n.children.forEach((c, i) => walk(c, id, i))
  }
  walk(root, null, 0)
  return entity === 'PageTreeNode' ? nodes : props
}

function answer(url) {
  const { pathname, searchParams } = new URL(url, 'http://stub')
  const [tenant, , entity] = pathname.split('/').filter(Boolean)
  const world = WORLD[tenant]
  if (world === undefined) return envelope([])

  if (entity === 'PageConfig') {
    const path = searchParams.get('filter.path')
    return envelope(
      path === null ? world.pages : world.pages.filter(p => p.path === path)
    )
  }
  if (entity === 'PageTree') return envelope([])
  if (entity === 'PageTreeNode' || entity === 'PageTreeProp') {
    return envelope(treeRows(tenant, searchParams.get('filter.treeId'), entity))
  }
  // A community exists if it has anyone in it; quiet_harbour has a founder.
  if (entity === 'User') return envelope([{ id: 'u1' }])
  return envelope([])
}

createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(answer(req.url ?? '/'))
}).listen(PORT, () => {
  process.stdout.write(`dbal-stub listening on ${PORT}\n`)
})
