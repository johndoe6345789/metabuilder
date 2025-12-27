# TODO 4 - DBAL (Database Abstraction Layer)

## TypeScript Implementation

- [ ] Complete adapter implementations for all supported backends (PostgreSQL, MySQL, SQLite)
- [ ] Add connection pooling configuration options to TypeScript adapters
- [ ] Implement retry logic with exponential backoff for transient failures
- [ ] Add query execution timeout configuration
- [x] Complete blob storage adapter implementation (`dbal/development/src/blob/index.ts`)
- [x] Add validation rules for all entity types (`dbal/development/src/core/validation.ts`)
- [ ] Implement batch operation support (bulk insert, bulk update, bulk delete)

## C++ Daemon

- [ ] Complete gRPC service implementation for production daemon
- [ ] Implement connection pooling in C++ daemon
- [ ] Add ACL enforcement layer with row-level security
- [ ] Implement query caching with configurable TTL
- [ ] Add metrics collection (query latency, connection count, error rates)
- [ ] Set up sandboxed execution environment for untrusted queries
- [ ] Implement graceful shutdown handling

## YAML Schema Contracts

- [ ] Define remaining entity schemas in `api/schema/entities/`
- [ ] Add operation schemas for all CRUD operations in `api/schema/operations/`
- [ ] Create versioning rules for backward compatibility
- [ ] Add JSON Schema validation for all YAML contracts
- [ ] Document schema migration patterns

## Conformance Testing

- [ ] Expand conformance tests in `common/contracts/` for edge cases
- [ ] Add stress testing scenarios for concurrent access
- [ ] Create test vectors for error handling paths
- [ ] Add integration tests between TypeScript and C++ implementations
- [ ] Implement automated conformance test runner (`tools/conformance/run_all.py`)

## Code Generation

- [ ] Update `tools/codegen/gen_types.py` to support new entity types
- [ ] Add C++ code generation for entity types
- [ ] Generate OpenAPI specifications from YAML contracts
- [ ] Create client SDK generators for multiple languages

## Documentation

- [ ] Complete QUICK_START guide with all setup steps
- [ ] Add troubleshooting guide for common DBAL issues
- [ ] Document security model and credential isolation
- [ ] Create architecture decision records (ADRs) for key design choices
