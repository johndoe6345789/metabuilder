# DBAL Capability Implementation

This document maps the capabilities declared in `api/schema/capabilities.yaml` to concrete implementations so reviewers can verify the runtime actually delivers what it advertises.

| Capability | Supported By | Status | Implementation Notes |
|------------|--------------|--------|----------------------|
| `transactions` | TypeScript `PrismaAdapter` + C++ `SqlAdapter` | ✅ | Example: `ts/src/adapters/prisma-adapter.ts` and C++ `SqlAdapter` wrap Prisma/libpq transactions with ACL validation. |
| `nested_transactions` | Prisma client | ✅ | Prisma supports SAVEPOINTs; the TypeScript adapter handles them via raw transactions (see `prisma-adapter.ts`). The C++ path currently runs SQL statements inside single transactions but uses the `SqlAdapter` scaffolding to add nested support later. |
| `joins` | Prisma, SQLite | ✅ | Prisma adapter uses `findMany` with includes; the SQLite stub demonstrates how to shape JOINs before SQL adapters are ready. C++ `SqlAdapter` executes SQL that can contain joins once `runQuery` is wired. |
| `full_text_search` | SQLite, MongoDB | ⚠️ | Supported via SQLite's FTS extension and MongoDB's text indexes; Prisma exposes `contains` filters. The C++ adapter relies on Prisma to offer search for now and falls back to Postgres `to_tsvector` when extended. |
| `ttl` | MongoDB | ⚠️ | TTL indexes exist in MongoDB adapters; other adapters require polling/cleanup jobs. |
| `json_queries` | Prisma, SQLite, MongoDB | ✅ | Prisma adapter exposes JSON filters; C++ `RequestsClient` + Native Prisma bridge can POST JSON filters to the Next.js API for `@prisma/client`. |
| `aggregations` | Prisma, SQLite, MongoDB | ✅ | Prisma adapter supports `aggregate` queries; SQL adapters can run `COUNT/SUM`. |
| `relations` | Prisma, SQLite | ✅ | Prisma adapter handles relations via `include`, while SQL adapters map foreign keys consistently once SQL statements cover them. |
| `migrations` | Prisma (automatic) | ✅ | `prisma migrate` workflows run ahead of TS/C++ builds; refer to `prisma/migrations` and `package.json` scripts. |
| `schema_introspection` | Prisma, SQLite | ✅ | Prisma schema is generated from DBAL (`prisma/schema.prisma`), keeping DBAL as the source of truth. |
| `connection_pooling` | Prisma + cpr HTTP client | ✅ | Prisma client manages pools for TypeScript; C++ `SqlPool` plus `RequestsClient` ensures safe reuse of HTTP/SQL connections. |
| `read_replicas` | Prisma (optional) | ⚠️ | Prisma supports multiple datasources; DBAL proxies to the configured `DATABASE_URL` and allows future replica awareness through `NativePrismaAdapter`. |

## Cross-Cutting Features

- **Native Prisma bridge** – `NativePrismaAdapter` calls `frontends/nextjs/src/app/api/native-prisma/route.ts`, which validates `DBAL_NATIVE_PRISMA_TOKEN`, translates `$n`/`?` placeholders into a `Prisma.sql` template, and executes the request through the shared Prisma client so the daemon can "speak native Prisma" without embedding Node.  
- **Capability detection** – `dbal/shared/tools/conformance` scripts run both TypeScript and C++ implementations against shared YAML contracts for `api/schema`.  
- **Graceful degradation** – SQL adapters default to returning meaningful `dbal::Error` values (`sql_adapter.hpp`), ensuring non-supported features degrade with clear error messages.

For concrete test coverage, see:

1. `dbal/development/tests` – Vitest suites covering Prisma adapter behaviors.  
2. `dbal/production/tests` – C++ unit tests that target entity CRUDs and will eventually target the SQL adapters once `runQuery` is implemented.  
3. Playwright suites in `frontends/nextjs/e2e` verify the UI paths that rely on DBAL capabilities.
