export interface DbBackend {
  name: string
  desc: string
  env: string
}

export const DB_BACKENDS: [DbBackend, ...DbBackend[]] = [
  {
    name: 'Memory',
    desc: 'In-memory adapter for tests and demos',
    env: 'DBAL_BACKEND=memory',
  },
  {
    name: 'SQLite',
    desc: 'Embedded file database for local installs',
    env: 'DATABASE_URL=sqlite://...',
  },
  {
    name: 'PostgreSQL',
    desc: 'Primary production relational backend',
    env: 'DATABASE_URL=postgres://...',
  },
  {
    name: 'MySQL',
    desc: 'Direct SQL backend for MySQL-compatible stores',
    env: 'DATABASE_URL=mysql://...',
  },
  {
    name: 'MongoDB',
    desc: 'Document storage for JSON/BSON data',
    env: 'DATABASE_URL=mongodb://...',
  },
  // Redis is deliberately absent. dbal's CMakeLists excludes
  // adapters/redis/ from the build, so a founder who set REDIS_URL from a
  // card here got nothing -- the card promised a backend the daemon does
  // not contain. Redis reaches DBAL only as a read-through cache via
  // DBAL_CACHE_URL, which is a deployment setting, not a data backend.
  {
    name: 'Elasticsearch',
    desc: 'Full-text index and search backend',
    env: 'ELASTICSEARCH_URL=http://...',
  },
  {
    name: 'SurrealDB',
    desc: 'Multi-model backend for graph-like data',
    env: 'SURREALDB_URL=http://...',
  },
]

export const DEFAULT_BACKEND = DB_BACKENDS[0]
