# Agent Development Guide for DBAL

This document provides guidance for AI agents and automated tools working with the DBAL codebase.

## Architecture Philosophy

The DBAL is designed as a **language-agnostic contract system** that separates:

1. **API Definition** (in YAML) - The source of truth
2. **Development Implementation** (TypeScript) - Fast iteration, testing, debugging
3. **Production Implementation** (C++) - Security, performance, isolation
4. **Shared Test Vectors** - Guarantees behavioral consistency

## Key Principles for Agents

### 1. API Contract is Source of Truth

**Always start with the API definition** when adding features:

```
1. Define entity in api/schema/entities/
2. Define operations in api/schema/operations/
3. Generate TypeScript types: python tools/codegen/gen_types.py
4. Generate C++ types: python tools/codegen/gen_types.py --lang=cpp
5. Implement in adapters
6. Add conformance tests
```

**Never** add fields, operations, or entities directly in TypeScript or C++ without updating the YAML schemas first.

### 2. TypeScript is for Development Speed

The TypeScript implementation prioritizes:
- **Fast iteration** - Quick to modify and test
- **Rich ecosystem** - npm packages, debugging tools
- **Easy prototyping** - Try ideas quickly

Use TypeScript for:
- New feature development
- Schema iteration
- Integration testing
- Developer debugging

### 3. C++ is for Production Security

The C++ implementation prioritizes:
- **Security** - Process isolation, sandboxing, no user code execution
- **Performance** - Optimized queries, connection pooling
- **Stability** - Static typing, memory safety
- **Auditability** - All operations logged

C++ daemon provides:
- Credential protection (user code never sees DB URLs/passwords)
- Query validation and sanitization
- Row-level security enforcement
- Resource limits and quotas

### 4. Conformance Tests Guarantee Parity

Every operation **must** have conformance tests that run against both implementations:

```yaml
# common/contracts/conformance_cases.yaml
- name: "User CRUD operations"
  setup:
    - create_user:
        username: "testuser"
        email: "test@example.com"
  tests:
    - create:
        entity: Post
        input: { title: "Test", author_id: "$setup.user.id" }
        expect: { status: "success" }
    - read:
        entity: Post
        input: { id: "$prev.id" }
        expect: { title: "Test" }
```

CI/CD runs these tests on **both** TypeScript and C++ implementations. If they diverge, the build fails.

## Development Workflow for Agents

### Adding a New Entity

```bash
# 1. Create entity schema
cat > api/schema/entities/comment.yaml << EOF
entity: Comment
version: "1.0"
fields:
  id: { type: uuid, primary: true, generated: true }
  content: { type: text, required: true }
  post_id: { type: uuid, required: true, foreign_key: { entity: Post, field: id } }
  author_id: { type: uuid, required: true }
  created_at: { type: datetime, generated: true }
EOF

# 2. Create operations
cat > api/schema/operations/comment.ops.yaml << EOF
operations:
  create:
    input: [content, post_id, author_id]
    output: Comment
    acl_required: ["comment:create"]
  list:
    input: [post_id]
    output: Comment[]
    acl_required: ["comment:read"]
EOF

# 3. Generate types
python tools/codegen/gen_types.py

# 4. Implement adapters (both TS and C++)
# - ts/src/adapters/prisma/mapping.ts
# - cpp/src/adapters/prisma/prisma_adapter.cpp

# 5. Add conformance tests
cat > common/contracts/comment_tests.yaml << EOF
- name: "Comment CRUD"
  operations:
    - action: create
      entity: Comment
      input: { content: "Great post!", post_id: "post_1", author_id: "user_1" }
      expected: { status: success }
EOF

# 6. Run conformance
python tools/conformance/run_all.py
```

### Modifying an Existing Entity

```bash
# 1. Update YAML schema
vim api/schema/entities/user.yaml
# Add: avatar_url: { type: string, optional: true }

# 2. Regenerate types
python tools/codegen/gen_types.py

# 3. Create migration (if using Prisma)
cd backends/prisma
npx prisma migrate dev --name add_avatar_url

# 4. Update adapters to handle new field
# Both ts/src/adapters/prisma/mapping.ts and C++ version

# 5. Add tests
# Update common/contracts/user_tests.yaml

# 6. Verify conformance
python tools/conformance/run_all.py
```

### Adding a Backend Adapter

```bash
# 1. Define capabilities
cat > api/schema/capabilities.yaml << EOF
adapters:
  mongodb:
    transactions: true
    joins: false
    full_text_search: true
    ttl: true
EOF

# 2. Create TypeScript adapter
mkdir -p ts/src/adapters/mongodb
cat > ts/src/adapters/mongodb/index.ts << EOF
export class MongoDBAdapter implements DBALAdapter {
  async create(entity: string, data: any): Promise<any> {
    // Implementation
  }
}
EOF

# 3. Create C++ adapter
mkdir -p cpp/src/adapters/mongodb
# Implement MongoDBAdapter class

# 4. Register adapter
# Update ts/src/core/client.ts and cpp/src/client.cpp

# 5. Test conformance
python tools/conformance/run_all.py --adapter=mongodb
```

## File Organization Rules

### api/ (Language-Agnostic Contracts)

```
api/
├── schema/
│   ├── entities/           # One file per entity
│   │   ├── user.yaml
│   │   ├── post.yaml
│   │   └── comment.yaml
│   ├── operations/         # One file per entity
│   │   ├── user.ops.yaml
│   │   ├── post.ops.yaml
│   │   └── comment.ops.yaml
│   ├── errors.yaml         # Single file for all errors
│   └── capabilities.yaml   # Single file for all adapter capabilities
```

**Rules:**
- One entity per file
- Use lowercase with underscores for filenames
- Version every entity (semantic versioning)
- Document breaking changes in comments

### ts/ (TypeScript Implementation)

```
ts/src/
├── core/                   # Core abstractions
│   ├── client.ts          # Main DBAL client
│   ├── types.ts           # Generated from YAML
│   └── errors.ts          # Error classes
├── adapters/              # One directory per backend
│   ├── prisma/
│   ├── sqlite/
│   └── mongodb/
├── query/                 # Query builder (backend-agnostic)
└── runtime/               # Config, secrets, telemetry
```

**Rules:**
- Keep files under 300 lines
- One class per file
- Use barrel exports (index.ts)
- No circular dependencies

### cpp/ (C++ Implementation)

```
cpp/
├── include/dbal/          # Public headers
├── src/                   # Implementation
├── tests/                 # Tests
└── CMakeLists.txt
```

**Rules:**
- Header guards: `#ifndef DBAL_CLIENT_HPP`
- Namespace: `dbal::`
- Use modern C++17 features
- RAII for resource management

### common/ (Shared Test Vectors)

```
common/
├── fixtures/              # Sample data
│   ├── seed/
│   └── datasets/
├── golden/                # Expected results
└── contracts/             # Conformance test definitions
    ├── user_tests.yaml
    ├── post_tests.yaml
    └── conformance_cases.yaml
```

**Rules:**
- YAML for test definitions
- JSON for fixtures
- One test suite per entity
- Include edge cases

## Code Generation

### Automated Type Generation

The DBAL uses Python scripts to generate TypeScript and C++ types from YAML schemas:

```python
# tools/codegen/gen_types.py
def generate_typescript_types(schema_dir: Path, output_file: Path):
    """Generate TypeScript interfaces from YAML schemas"""
    
def generate_cpp_types(schema_dir: Path, output_dir: Path):
    """Generate C++ structs from YAML schemas"""
```

**When to regenerate:**
- After modifying any YAML in `api/schema/`
- Before running tests
- As part of CI/CD pipeline

### Manual Code vs Generated Code

**Generated (Never edit manually):**
- `ts/src/core/types.ts` - Entity interfaces
- `ts/src/core/errors.ts` - Error classes
- `cpp/include/dbal/types.hpp` - Entity structs
- `cpp/include/dbal/errors.hpp` - Error types

**Manual (Safe to edit):**
- Adapter implementations
- Query builder
- Client facade
- Utility functions

## Testing Strategy

### 1. Unit Tests (Per Implementation)

```bash
# TypeScript
cd ts && npm run test:unit

# C++
cd cpp && ./build/tests/unit_tests
```

Test individual functions and classes in isolation.

### 2. Integration Tests (Per Implementation)

```bash
# TypeScript
cd ts && npm run test:integration

# C++
cd cpp && ./build/tests/integration_tests
```

Test adapters against real databases (with Docker).

### 3. Conformance Tests (Cross-Implementation)

```bash
# Both implementations
python tools/conformance/run_all.py
```

**Critical:** These must pass for both TS and C++. If they diverge, it's a bug.

### 4. Security Tests (C++ Only)

```bash
cd cpp && ./build/tests/security_tests
```

Test sandboxing, ACL enforcement, SQL injection prevention.

## Security Considerations for Agents

### What NOT to Do

❌ **Never** expose database credentials to user code
❌ **Never** allow user code to construct raw SQL queries
❌ **Never** skip ACL checks
❌ **Never** trust user input without validation
❌ **Never** log sensitive data (passwords, tokens, PII)

### What TO Do

✅ **Always** validate input against schema
✅ **Always** enforce row-level security
✅ **Always** use parameterized queries
✅ **Always** log security-relevant operations
✅ **Always** test with malicious input

### Sandboxing Requirements (C++ Daemon)

The C++ daemon must:

1. **Run with minimal privileges** (drop root, use dedicated user)
2. **Restrict file system access** (no write outside /var/lib/dbal/)
3. **Limit network access** (only to DB, no outbound internet)
4. **Enforce resource limits** (CPU, memory, connections)
5. **Validate all RPC calls** (schema conformance, ACL checks)

### ACL Enforcement

Every operation must check:

```cpp
// C++ daemon
bool DBALDaemon::authorize(const Request& req) {
    User user = req.user();
    string entity = req.entity();
    string operation = req.operation();
    
    // 1. Check entity-level permission
    if (!acl_.hasPermission(user, entity, operation)) {
        return false;
    }
    
    // 2. Apply row-level filter
    if (operation == "update" || operation == "delete") {
        return acl_.canAccessRow(user, entity, req.id());
    }
    
    return true;
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: DBAL CI/CD

on: [push, pull_request]

jobs:
  typescript:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd dbal/ts && npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      
  cpp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd dbal/cpp && cmake -B build && cmake --build build
      - run: ./build/tests/unit_tests
      - run: ./build/tests/integration_tests
      
  conformance:
    needs: [typescript, cpp]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: python dbal/tools/conformance/run_all.py
```

### Pre-commit Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash
cd dbal/api/schema
if git diff --cached --name-only | grep -q "\.yaml$"; then
    echo "YAML schema changed, regenerating types..."
    python ../../tools/codegen/gen_types.py
    git add ../ts/src/core/types.ts
    git add ../cpp/include/dbal/types.hpp
fi
```

## Deployment Architecture

### Development Environment

```
┌─────────────────┐
│  Spark App (TS) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ DBAL Client (TS)│
└────────┬────────┘
         │ (direct)
         ▼
┌─────────────────┐
│ Prisma Client   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQLite / DB    │
└─────────────────┘
```

### Production Environment

```
┌─────────────────┐
│  Spark App (TS) │
└────────┬────────┘
         │ gRPC
         ▼
┌─────────────────┐
│ DBAL Client (TS)│
└────────┬────────┘
         │ gRPC/WS
         ▼
┌─────────────────┐     ┌─────────────────┐
│ DBAL Daemon(C++)│────▶│  Network Policy │
│   [Sandboxed]   │     │  (Firewall)     │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Prisma Client   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  dbal-daemon:
    build: ./dbal/cpp
    container_name: dbal-daemon
    ports:
      - "50051:50051"
    environment:
      - DBAL_MODE=production
      - DBAL_SANDBOX=strict
      - DATABASE_URL=postgresql://user:pass@postgres:5432/db
    volumes:
      - ./config:/config:ro
    security_opt:
      - no-new-privileges:true
    read_only: true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      
  postgres:
    image: postgres:15
    container_name: dbal-postgres
    environment:
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - internal

networks:
  internal:
    internal: true

volumes:
  postgres-data:
```

## Troubleshooting for Agents

### Problem: Types out of sync with schema

**Solution:**
```bash
python tools/codegen/gen_types.py
```

### Problem: Conformance tests failing

**Diagnosis:**
```bash
# Run verbose
python tools/conformance/run_all.py --verbose

# Compare outputs
diff common/golden/ts_results.json common/golden/cpp_results.json
```

### Problem: C++ daemon won't start in production

**Check:**
1. Permissions: `ls -la /var/lib/dbal/`
2. Ports: `netstat -tlnp | grep 50051`
3. Logs: `journalctl -u dbal-daemon`
4. Database connectivity: `nc -zv postgres 5432`

### Problem: Security audit failing

**Review:**
- No hardcoded secrets
- All queries use parameters
- ACL checks on every operation
- Audit logs enabled

## Best Practices Summary

1. ✅ **Schema first** - Define in YAML, generate code
2. ✅ **Test both** - TS and C++ must pass conformance tests
3. ✅ **Security by default** - ACL on every operation
4. ✅ **Documentation** - Update README when adding features
5. ✅ **Versioning** - Semantic versioning for API changes
6. ✅ **Backward compatibility** - Support N-1 versions
7. ✅ **Fail fast** - Validate early, error clearly
8. ✅ **Audit everything** - Log security-relevant operations
9. ✅ **Principle of least privilege** - Minimal permissions
10. ✅ **Defense in depth** - Multiple layers of security

## Resources

- **API Schema Reference**: [api/schema/README.md](api/schema/README.md)
- **TypeScript Guide**: [ts/README.md](ts/README.md)
- **C++ Guide**: [cpp/README.md](cpp/README.md)
- **Security Guide**: [docs/SECURITY.md](../docs/SECURITY.md)
- **Contributing**: [docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md)
