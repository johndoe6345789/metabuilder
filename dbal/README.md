# Database Abstraction Layer (DBAL)

A language-agnostic database abstraction layer that provides a secure interface between client applications and database backends. The DBAL uses TypeScript for rapid development and testing, with a C++ production layer for enhanced security and performance.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Application (Spark)                   │
│                         (TypeScript/React)                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DBAL Client                              │
│              (TypeScript Dev / C++ Production)                   │
│  ┌────────────────────┬──────────────────┬────────────────────┐ │
│  │  Query Builder     │  Validation      │  Error Handling    │ │
│  └────────────────────┴──────────────────┴────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    IPC/RPC Bridge       │
                    │   (gRPC/WebSocket)      │
                    └────────────┬────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                      DBAL Daemon (C++)                           │
│              [Production Only - Sandboxed]                       │
│  ┌────────────────────┬──────────────────┬────────────────────┐ │
│  │  Auth/ACL          │  Query Executor  │  Connection Pool   │ │
│  └────────────────────┴──────────────────┴────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
           ┌────────────────┐       ┌────────────────┐
           │  Prisma Client │       │  SQLite Direct │
           │  (Server-side) │       │   (Embedded)   │
           └────────────────┘       └────────────────┘
                    │                         │
                    ▼                         ▼
           ┌────────────────┐       ┌────────────────┐
           │   PostgreSQL   │       │   SQLite DB    │
           │     MySQL      │       │                │
           │   SQL Server   │       │                │
           └────────────────┘       └────────────────┘
```

## Supported Databases

The Prisma adapter behind DBAL already targets the databases you care about: PostgreSQL, MySQL, SQLite, and any other engine Prisma supports (SQL Server, CockroachDB, MongoDB, etc.). Switch between them by pointing `DATABASE_URL` at the desired backend and regenerating the Prisma client for your schema.

The TypeScript client exposes three Prisma-based adapters: `PrismaAdapter`, `PostgresAdapter`, and `MySQLAdapter`. Setting `config.adapter` to `'postgres'` or `'mysql'` constructs the dialect-specific adapter, which keeps the shared Prisma logic but tweaks the capabilities metadata (e.g., enabling full-text search where supported) and leaves the rest of the stack focused on validation, ACLs, and audit logging.

```bash
# PostgreSQL
export DATABASE_URL="postgresql://user:pass@db:5432/metabuilder"

# MySQL
export DATABASE_URL="mysql://user:pass@db:3306/metabuilder"

npx prisma generate
```

With `config.adapter = 'prisma'`, DBAL sends every request through `PrismaAdapter`, and Prisma handles dialect differences, migrations, and connection pooling defined in `prisma/schema.prisma` and `prisma/migrations/`. That keeps DBAL focused on validation, ACLs, and audit logging while it can still drive PostgreSQL, MySQL, or any other Prisma-supported store.

The C++ daemon still resides in Phase 3—the current implementation is backed by the in-memory store described in `dbal/cpp/docs/PHASE3_DAEMON.md`, so Postgres/MySQL adapters for the daemon are still future work.

### Native Prisma bridge

The Phase 3 daemon can still leverage Prisma without bundling Node by calling `NativePrismaAdapter`. Each SQL plan is serialized as a JSON payload with the `$n` or `?` placeholders plus parameters and sent to `/api/native-prisma` on the Next.js server. The API route validates `DBAL_NATIVE_PRISMA_TOKEN`, reconstructs a `Prisma.sql` template, executes the query through the shared Prisma client, and returns rows or affected counts so the daemon sees the same `SqlRow`/`int` values as a regular SQL adapter. Set the same `DBAL_NATIVE_PRISMA_TOKEN` (mirrored in `frontends/nextjs/.env.example`) when running the daemon so the bridge rejects unauthorized callers.

## Design Principles

1. **Language Agnostic**: API contracts defined in YAML/Proto, not tied to any language
2. **Security First**: C++ daemon sandboxes all database access with ACL enforcement
3. **Development Speed**: TypeScript implementation for rapid iteration
4. **Zero Trust**: User code never touches database credentials or raw connections
5. **Capability-based**: Adapters declare what they support (transactions, joins, TTL, etc.)
6. **Testable**: Shared test vectors ensure both implementations behave identically

## Repository Structure

```
dbal/
├── api/                    # Language-agnostic contracts (source of truth)
│   ├── schema/            # Entity and operation definitions
│   ├── idl/               # Optional: Proto/FlatBuffers schemas
│   └── versioning/        # Compatibility rules
├── common/                # Shared test vectors and fixtures
├── ts/                    # TypeScript implementation (development)
├── cpp/                   # C++ implementation (production)
├── backends/              # Backend-specific assets
├── tools/                 # Code generation and build tools
└── scripts/               # Cross-platform build scripts
```

## Quick Start

### Development Mode (TypeScript)

```bash
cd dbal/ts
npm install
npm run build
npm test
```

### Production Mode (C++ Daemon)

```bash
cd dbal/cpp
mkdir build && cd build
cmake ..
make
./dbal_daemon --config=../config/prod.yaml
```

### GitHub Spark Integration

For GitHub Spark deployments, the DBAL daemon runs as a sidecar service:

```yaml
# In your Spark deployment config
services:
  dbal:
    image: your-org/dbal-daemon:latest
    ports:
      - "50051:50051"  # gRPC endpoint
    environment:
      - DBAL_MODE=production
      - DBAL_SANDBOX=strict
```

## Monitoring & Daemon UI

`frontends/dbal` is a dedicated Next.js mini-app that showcases the C++ daemon's architecture, deployment readiness, and the `ServerStatusPanel`. The main `frontends/nextjs` app re-exports the `@dbal-ui` component at `/dbal-daemon`, and the panel polls `/api/status` (the shared feed lives in `frontends/dbal/src/status.ts`). Keep this page covered with `frontends/nextjs/e2e/dbal-daemon/daemon.spec.ts` and `playwright.dbal-daemon.config.ts`, or run `npm run test:e2e:dbal-daemon` after touching the UI.

## Security Model

### Sandboxing Strategy

1. **Process Isolation**: Daemon runs in separate process with restricted permissions
2. **Capability-based Security**: Each request checked against user ACL
3. **Query Validation**: All queries parsed and validated before execution
4. **Credential Protection**: DB credentials never exposed to client code
5. **Audit Logging**: All operations logged for security review

### ACL System

```yaml
user: "user_123"
role: "editor"
permissions:
  - entity: "posts"
    operations: [create, read, update]
    filters:
      author_id: "$user.id"  # Row-level security
  - entity: "comments"
    operations: [create, read]
```

## API Contract Example

### HTTP Utilities

For outbound integrations the daemon can use the new requests-inspired helper `runtime::RequestsClient`. It wraps the `cpr` HTTP helpers, exposes `get`/`post` helpers, parses JSON responses, and throws clean timeouts so code paths stay predictable.

Native Prisma calls route through `NativePrismaAdapter`, which currently POSTs to the `/api/native-prisma` Next.js API and returns the raw JSON rows or affected count using that helper. When the daemon calls `runQuery`/`runNonQuery`, the response is mapped back into `SqlRow` results so the rest of the stack stays unaware of the HTTP transport.

```cpp
using namespace dbal::runtime;

RequestsClient http("https://api.prisma.example");
auto response = http.post("/rpc/execute", jsonPayload.dump(), {{"Authorization", "Bearer ..."}});
if (response.statusCode == 200) {
  const auto result = response.json["result"];
  // handle Prisma response
}
```

### Entity Definition (YAML)

```yaml
# api/schema/entities/post.yaml
entity: Post
version: "1.0"
fields:
  id:
    type: uuid
    primary: true
    generated: true
  title:
    type: string
    required: true
    max_length: 200
  content:
    type: text
    required: true
  author_id:
    type: uuid
    required: true
    foreign_key:
      entity: User
      field: id
  created_at:
    type: datetime
    generated: true
  updated_at:
    type: datetime
    auto_update: true
```

### Operations (YAML)

```yaml
# api/schema/operations/post.ops.yaml
operations:
  create:
    input: [title, content, author_id]
    output: Post
    acl_required: ["post:create"]
    
  read:
    input: [id]
    output: Post
    acl_required: ["post:read"]
    
  update:
    input: [id, title?, content?]
    output: Post
    acl_required: ["post:update"]
    row_level_check: "author_id = $user.id"
    
  delete:
    input: [id]
    output: boolean
    acl_required: ["post:delete"]
    row_level_check: "author_id = $user.id OR $user.role = 'admin'"
    
  list:
    input: [filter?, sort?, page?, limit?]
    output: Post[]
    acl_required: ["post:read"]
```

## Client Usage

### TypeScript Client

```typescript
import { DBALClient } from '@metabuilder/dbal'

const client = new DBALClient({
  mode: 'development', // or 'production'
  endpoint: 'localhost:50051',
  auth: {
    user: currentUser,
    session: currentSession
  }
})

// CRUD operations
const post = await client.posts.create({
  title: 'Hello World',
  content: 'This is my first post',
  author_id: user.id
})

const posts = await client.posts.list({
  filter: { author_id: user.id },
  sort: { created_at: 'desc' },
  limit: 10
})

const updated = await client.posts.update(post.id, {
  title: 'Updated Title'
})

await client.posts.delete(post.id)
```

## Development Workflow

1. **Define Schema**: Edit YAML files in `api/schema/`
2. **Generate Code**: `python tools/codegen/gen_types.py`
3. **Implement Adapter**: Add backend support in `ts/src/adapters/`
4. **Write Tests**: Create conformance tests in `common/fixtures/`
5. **Run Tests**: `npm run test:conformance`
6. **Build C++ Daemon**: `cd cpp && cmake --build build`
7. **Deploy**: Use Docker/Kubernetes to deploy daemon

## Testing

### Conformance Testing

The DBAL includes comprehensive conformance tests that ensure both TypeScript and C++ implementations behave identically:

```bash
# Run all conformance tests
python tools/conformance/run_all.py

# Run TS tests only
cd ts && npm run test:conformance

# Run C++ tests only
cd cpp && ./build/tests/conformance_tests
```

### Test Vectors

Shared test vectors in `common/fixtures/` ensure consistency:

```yaml
# common/contracts/conformance_cases.yaml
- name: "Create and read post"
  operations:
    - action: create
      entity: Post
      input:
        title: "Test Post"
        content: "Test content"
        author_id: "user_123"
      expected:
        status: success
        output:
          id: "<uuid>"
          title: "Test Post"
    - action: read
      entity: Post
      input:
        id: "$prev.id"
      expected:
        status: success
        output:
          title: "Test Post"
```

## Migration from Current System

### Phase 1: Development Mode (Complete)
- Use TypeScript DBAL client in development
- Direct Prisma access (no daemon)
- Validates API contract compliance

### Phase 2: Hybrid Mode (Current Implementation)
- Complete TypeScript DBAL client with Prisma adapter
- WebSocket bridge for remote daemon communication (prepared for C++)
- ACL enforcement and audit logging in TypeScript
- Runs entirely in GitHub Spark environment
- Prepares architecture for C++ daemon migration

### Phase 3: Full Production (Future)
- All environments use C++ daemon
- TypeScript client communicates via WebSocket/gRPC
- Maximum security and performance
- Requires infrastructure beyond GitHub Spark

## Capabilities System

Different backends support different features:

```yaml
# api/schema/capabilities.yaml
adapters:
  prisma:
    transactions: true
    joins: true
    full_text_search: false
    ttl: false
    json_queries: true
    
  sqlite:
    transactions: true
    joins: true
    full_text_search: true
    ttl: false
    json_queries: true
    
  mongodb:
    transactions: true
    joins: false
    full_text_search: true
    ttl: true
    json_queries: true
```

Client code can check capabilities:

```typescript
if (await client.capabilities.hasJoins()) {
  // Use join query
} else {
  // Fall back to multiple queries
}
```

## Error Handling

Standardized errors across all implementations:

```yaml
# api/schema/errors.yaml
errors:
  NOT_FOUND:
    code: 404
    message: "Entity not found"
    
  CONFLICT:
    code: 409
    message: "Entity already exists"
    
  UNAUTHORIZED:
    code: 401
    message: "Authentication required"
    
  FORBIDDEN:
    code: 403
    message: "Insufficient permissions"
    
  VALIDATION_ERROR:
    code: 422
    message: "Validation failed"
    fields:
      - field: string
        error: string
```

## Contributing

See [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](LICENSE)
