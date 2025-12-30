import Link from 'next/link'
import { ServerStatusPanel } from './ServerStatusPanel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DBAL Daemon',
  description: 'C++ DBAL daemon overview, architecture, and observability.',
}

const architectureHighlights = [
  {
    title: 'Sandboxed gRPC Gateway',
    description:
      'TLS-enabled WebSocket/JSON-RPC front door with auth, rate limiting, and ACL enforcement before any query reaches the database.',
  },
  {
    title: 'Query Executor',
    description:
      'Builds safe, parameterized SQL statements, validates ACL rules, and routes requests through the configured adapters.',
  },
  {
    title: 'Adapter Layer',
    description:
      'Pluggable backends (Postgres/MySQL/SQLite) with typed capability metadata so the core client stays agnostic to the engine.',
  },
]

const securityFeatures = [
  'Process isolation, capability enforcement, and a least-privilege sandbox per deployment.',
  'Credential vault referenced by the daemon only — secrets never leak to the TypeScript client.',
  'Audit logging for every RPC call, including user, operation, entity, and success/failure.',
  'Row-level security + per-operation ACL checks keep queries scoped to the requester.',
]

export function DBALDaemonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background/80 via-background to-muted/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">DBAL</p>
          <h1 className="mt-4 text-4xl font-extrabold text-foreground">C++ Daemon</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            A hardened, sandboxed C++ daemon isolates your production databases. It validates every request, enforces ACLs, and executes SQL through safe adapters so the TypeScript client never touches credentials.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dbal-daemon"
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-card shadow transition hover:bg-primary/90"
            >
              Visit daemon docs
            </Link>
            <Link
              href="/dbal-daemon#status"
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground"
            >
              Check status
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {architectureHighlights.map(item => (
            <article key={item.title} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 to-transparent p-8 shadow-inner">
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-foreground">Security First</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {securityFeatures.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              Future build artifacts expose TCP/Unix socket endpoints that your monitoring stack can scrape, while audit logs land in a write-only bucket.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-foreground">Deployment Readiness</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Dependencies</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                C++17, CMake 3.20+, libpq/mysqlclient, SQLite, OpenSSL, and Boost.Beast power the daemon stack used in Kubernetes/Spark deployments.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Configuration</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                `server`, `database`, `security`, and `performance` keys live in `dbal/production/config/production.yaml`. Credentials reference environment secrets, while audit paths are write-only.
              </p>
            </div>
          </div>
        </section>

        <section id="status" className="rounded-3xl border border-border/60 bg-card/90 p-8 shadow-xl">
          <ServerStatusPanel />
        </section>
      </div>
    </div>
  )
}
