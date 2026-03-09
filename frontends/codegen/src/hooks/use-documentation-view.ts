import { useCallback, useState } from 'react'
import type { ChangeEvent } from 'react'

interface TabDoc {
  title: string
  sections: string[]
}

const tabContent: Record<string, TabDoc> = {
  readme: {
    title: 'CodeForge IDE',
    sections: [
      'CodeForge is a low-code React application builder where every UI — pages, dialogs, data tables, charts — is defined as JSON and rendered by a generic engine. The 95% data, 5% code philosophy means business logic lives in declarative config, not hand-written TSX.',
      'Components are registered in a central registry and composed via JSON definitions. Stateful behaviour is handled by custom hooks wired through createJsonComponentWithHooks, keeping the JSON pure data and the hooks pure logic.',
      'The DBAL layer provides a unified REST API over 14 database backends (SQLite, PostgreSQL, MongoDB, Redis, Elasticsearch, and more). The frontend accesses data through redux-persist (IndexedDB) first, falling back to live DBAL calls when the backend is reachable.',
      'Multi-tenancy is enforced at every level: every DBAL query is filtered by tenantId, every Redux slice scopes state to the active tenant, and every API route validates the tenant header before processing.',
    ],
  },
  roadmap: {
    title: 'Roadmap',
    sections: [
      'Universal Platform is the next major milestone. It introduces a State Machine runtime, a Command Bus for cross-component messaging, an Event Stream for audit trails, a Virtual File System for project assets, and a Frontend Bus for inter-panel communication.',
      '100% JSON coverage for application-layer components is the parallel migration goal. The remaining TSX organisms (DataSourceManager, NavigationMenu, TreeListPanel) will be converted using the createJsonComponentWithHooks pattern.',
      'Workflow expansion will add 30+ new plugin nodes across Python, TypeScript, Go, Rust, and Mojo runtimes. The visual workflow editor will gain sub-workflow support and real-time execution telemetry.',
      'Additional DBAL backends planned: ClickHouse for analytics queries, DynamoDB for AWS deployments, and a generic HTTP adapter for arbitrary REST APIs. Each adapter follows the 14-method CRUD + bulk + query + metadata interface.',
    ],
  },
  agents: {
    title: 'AI Agents',
    sections: [
      'AI agents in MetaBuilder are workflow nodes that receive typed input, call an LLM or tool, and emit typed output. Each agent is defined in JSON with a model ID, system prompt, tool bindings, and an output schema validated by Zod.',
      'Agents run inside the DAG workflow engine and can fan-out to parallel sub-agents, aggregate results, or gate execution on confidence thresholds. The workflow runtime handles retries, timeouts, and dead-letter routing automatically.',
      'Tool bindings connect agents to DBAL entities, external REST APIs, or other workflow nodes. A binding declares the input mapping, the HTTP method, and the output path — all in JSON, no glue code required.',
      'Agent outputs feed directly into the UI via redux-persist. A React component subscribes to the relevant slice; when the agent completes, the store updates and the UI re-renders with the new data without any manual wiring.',
    ],
  },
  pwa: {
    title: 'Progressive Web App',
    sections: [
      'CodeForge ships as a PWA installable on desktop and mobile. The service worker pre-caches all static assets at install time, ensuring the shell loads offline even when the backend is unreachable.',
      'Client-side state is persisted in IndexedDB via redux-persist. Every Redux slice that needs offline durability declares a persistConfig with a storage key and a whitelist of fields to serialize.',
      'The DBAL layer degrades gracefully: listFromDBAL returns an empty array and warns (not errors) when the daemon is offline. Components render cached IndexedDB state immediately and rehydrate from the live API once connectivity resumes.',
      'Background sync queues mutations made offline and replays them against the DBAL API once the connection is restored. Conflict resolution uses last-write-wins by default, with a pluggable strategy for domain-specific merge logic.',
    ],
  },
  sass: {
    title: 'Sass & Theming',
    sections: [
      'All styling uses SCSS modules with Material Design 3 CSS custom properties (--mat-sys-*). Components never hard-code colour values — they reference semantic tokens like --mat-sys-primary, --mat-sys-surface, and --mat-sys-on-surface-variant.',
      'Design tokens are defined per-package in packages/*/styles/tokens.json. The token compiler transforms JSON to SCSS variable maps and injects them into the global theme layer, enabling per-tenant theming at runtime by swapping a single CSS class on the root element.',
      'FakeMUI is the in-house Material UI clone that consumes these tokens. It provides 145 core components and 22 email-specific components across 11 categories, all backed by SCSS modules with no runtime CSS-in-JS overhead.',
      'Dark mode is supported via a CSS class toggle on the document root. The MD3 token system provides dark-mode variants for every semantic token automatically — no per-component dark-mode overrides are needed.',
    ],
  },
  cicd: {
    title: 'CI/CD',
    sections: [
      'GitHub Actions runs four pipelines: build-and-test (Node 20, Vitest + Playwright), docker-build (multi-stage images with BuildKit cache), schema-validate (JSON Schema + YAML linting), and release (npm publish + Docker Hub push on tag).',
      'Docker images use multi-stage builds. The builder stage runs npm ci and next build; the runner stage copies only the .next/standalone output into a node:20-alpine image, keeping runtime images under 500 MB.',
      'Playwright e2e tests run against the full Docker stack (nginx, codegen, DBAL, PostgreSQL) spun up in the CI environment via docker compose. Tests are parallelised across 4 workers with a 5-minute timeout per suite.',
      'The build matrix covers Node 20 (frontend), C++17 with Conan (DBAL daemon), and Python 3.9+ (workflow plugins). All three are built in the same workflow run so a single PR failing any target blocks the merge.',
    ],
  },
}

const tabs = [
  { value: 'readme', label: 'README', icon: 'BookOpen' },
  { value: 'roadmap', label: 'Roadmap', icon: 'MapPin' },
  { value: 'agents', label: 'Agents', icon: 'Sparkle' },
  { value: 'pwa', label: 'PWA', icon: 'Rocket' },
  { value: 'sass', label: 'Sass', icon: 'PaintBrush' },
  { value: 'cicd', label: 'CI/CD', icon: 'GitBranch' },
]

export function useDocumentationView() {
  const [activeTab, setActiveTab] = useState('readme')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }, [])

  const doc = tabContent[activeTab] ?? { title: '', sections: [] }

  return {
    activeTab,
    searchQuery,
    handleSearchChange,
    activeTabTitle: doc.title,
    activeTabSections: doc.sections.map((text, i) => ({ id: `${activeTab}-p${i}`, text })),
    tabsData: tabs.map(tab => ({
      ...tab,
      isSelected: tab.value === activeTab,
      onSelect: () => setActiveTab(tab.value),
    })),
  }
}
