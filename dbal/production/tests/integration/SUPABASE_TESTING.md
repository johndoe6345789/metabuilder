# Supabase Backend Testing Guide

## Overview

The DBAL daemon supports Supabase in two modes:
1. **REST API mode** - HTTP client using Supabase REST API
2. **Direct PostgreSQL mode** - Raw PostgreSQL connection to Supabase database

## Setup Options

### Option 1: Use Hosted Supabase (Recommended for Full Testing)

1. **Create a Supabase Project**:
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Set Environment Variables**:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_KEY="your-anon-key"
   export SUPABASE_SERVICE_KEY="your-service-role-key"
   ```

3. **Configure Database Schema**:
   - Supabase uses the same PostgreSQL schema as DBAL
   - Enable Row Level Security (RLS) for multi-tenant support
   - Run schema migrations via Supabase dashboard or CLI

4. **Run Tests**:
   ```bash
   # Test REST API mode
   python3 dev-container.py test-matrix --backend supabase_rest

   # Test Direct PostgreSQL mode
   python3 dev-container.py test-matrix --backend supabase_postgres
   ```

### Option 2: Local Supabase Stack (Full Feature Testing)

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Initialize Local Supabase**:
   ```bash
   cd dbal/production/tests/integration
   supabase init
   supabase start
   ```

3. **Get Local Credentials**:
   ```bash
   supabase status
   # Note: API URL, anon key, service key
   ```

4. **Update Test Configuration**:
   ```python
   # In test_matrix.py BACKENDS dict:
   'supabase_rest': {
       'adapter': 'supabase',
       'database_url': 'http://localhost:54321',  # Local API
       'supabase_mode': 'rest',
       'supabase_key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  # From supabase status
   }
   ```

5. **Run Tests**:
   ```bash
   python3 dev-container.py test-matrix --backend supabase_rest
   ```

### Option 3: Supabase-Compatible PostgreSQL (Minimal Setup)

Use the existing PostgreSQL container with Supabase-style configuration:

1. **Enable RLS on PostgreSQL**:
   ```sql
   -- Connect to metabuilder database
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   -- Create RLS policy for multi-tenant
   CREATE POLICY tenant_isolation ON users
       USING (tenant_id = current_setting('app.current_tenant')::text);
   ```

2. **Test with Direct PostgreSQL**:
   ```bash
   # Uses local postgres container
   python3 dev-container.py test-matrix --backend postgres
   ```

## Backend Configurations

### REST API Mode

**Adapter**: `supabase`
**Mode**: `rest`
**Protocol**: HTTPS
**Authentication**: API Key (anon or service role)

**Config**:
```json
{
  "adapter": "supabase",
  "database_url": "https://your-project.supabase.co",
  "mode": "production",
  "supabase_mode": "rest",
  "supabase_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Features Tested**:
- ✅ REST API CRUD operations
- ✅ Authentication headers
- ✅ Row-level security
- ✅ JSON response parsing
- ✅ Error handling
- ⚠️  Real-time subscriptions (requires WebSocket)
- ⚠️  Edge functions (requires separate testing)

### Direct PostgreSQL Mode

**Adapter**: `supabase`
**Mode**: `postgres`
**Protocol**: PostgreSQL wire protocol
**Authentication**: Database credentials

**Config**:
```json
{
  "adapter": "supabase",
  "database_url": "postgresql://postgres:postgres@db.your-project.supabase.co:5432/postgres",
  "mode": "production",
  "supabase_mode": "postgres"
}
```

**Features Tested**:
- ✅ Direct SQL queries
- ✅ Connection pooling
- ✅ Transaction support
- ✅ RLS policies
- ✅ PostgreSQL extensions
- ✅ Full SQL feature set

## Multi-Tenant Support

Supabase excels at multi-tenancy via Row-Level Security:

### Automatic Tenant Isolation

```sql
-- Create tenant_id column
ALTER TABLE users ADD COLUMN tenant_id TEXT NOT NULL;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant')::text);

-- Set tenant in session
SET app.current_tenant = 'tenant_123';
```

### DBAL Integration

The DBAL daemon automatically:
1. Extracts `tenantId` from request
2. Sets PostgreSQL session variable
3. All queries filtered by RLS policy
4. No application-level filtering needed

## Expected Test Results

### REST API Mode

```
Testing Backend: supabase_rest
================================================================================
  🚀 Starting daemon with supabase_rest backend...
  ✓ Daemon is ready on port 8080
  🧪 Running tests for supabase_rest...
  ✓ 17/17 tests passed

supabase_rest        ✅ PASS
  Tests: 17/17 passed
```

### Direct PostgreSQL Mode

```
Testing Backend: supabase_postgres
================================================================================
  🚀 Starting daemon with supabase_postgres backend...
  ✓ Daemon is ready on port 8080
  🧪 Running tests for supabase_postgres...
  ✓ 17/17 tests passed

supabase_postgres    ✅ PASS
  Tests: 17/17 passed
```

## Troubleshooting

### REST API Issues

**Problem**: 401 Unauthorized
- **Solution**: Check SUPABASE_KEY environment variable
- **Verify**: Key matches project (anon vs service role)

**Problem**: CORS errors
- **Solution**: Supabase handles CORS automatically for REST API
- **Check**: Daemon is sending correct `apikey` header

**Problem**: RLS blocks all queries
- **Solution**: Use service role key for admin access
- **Or**: Configure RLS policies to allow operations

### Direct PostgreSQL Issues

**Problem**: Connection refused
- **Solution**: Check Supabase project allows direct connections
- **Verify**: Connection pooler settings (port 5432 vs 6543)

**Problem**: SSL required
- **Solution**: Add `?sslmode=require` to connection string
- **Example**: `postgresql://user:pass@host:5432/db?sslmode=require`

**Problem**: RLS denies queries
- **Solution**: Set session variable before queries:
  ```sql
  SET app.current_tenant = 'tenant_id';
  ```

## Comparison: REST vs Direct PostgreSQL

| Feature | REST API | Direct PostgreSQL |
|---------|----------|-------------------|
| **Speed** | Slower (HTTP overhead) | Faster (wire protocol) |
| **Features** | Limited to REST endpoints | Full SQL support |
| **RLS** | Automatic | Manual session setup |
| **Auth** | API key | Database credentials |
| **Connection Pooling** | Built-in | Requires pgBouncer |
| **Real-time** | WebSocket required | PostgreSQL LISTEN/NOTIFY |
| **Best For** | Public APIs, mobile apps | Backend services, ETL |

## Performance Testing

### REST API Benchmarks

```bash
# Single request latency
curl -w "@curl-format.txt" -o /dev/null -s \
  -H "apikey: $SUPABASE_KEY" \
  https://your-project.supabase.co/rest/v1/users

# Concurrent requests
ab -n 1000 -c 10 \
  -H "apikey: $SUPABASE_KEY" \
  https://your-project.supabase.co/rest/v1/users
```

### Direct PostgreSQL Benchmarks

```bash
# Connection test
pgbench -c 10 -j 2 -t 1000 \
  postgresql://postgres:postgres@db.your-project.supabase.co:5432/postgres

# Query throughput
pgbench -c 10 -j 2 -t 10000 -S \
  postgresql://postgres:postgres@db.your-project.supabase.co:5432/postgres
```

## Security Best Practices

### REST API Mode

1. **Use Anon Key for Client Apps**:
   - Safe to expose in frontend
   - Limited by RLS policies

2. **Use Service Role Key for Backend**:
   - Never expose to clients
   - Bypasses RLS (admin access)

3. **Implement Rate Limiting**:
   - Supabase has built-in limits
   - Monitor usage in dashboard

### Direct PostgreSQL Mode

1. **Use Read-Only User**:
   ```sql
   CREATE USER readonly WITH PASSWORD 'secure-password';
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
   ```

2. **Require SSL**:
   ```bash
   export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

3. **Use Connection Pooling**:
   - Supabase provides pgBouncer
   - Port 6543 for pooled connections

## Next Steps

1. **Create Supabase Project** (or use local stack)
2. **Set Environment Variables** (URL + Keys)
3. **Run Test Matrix**:
   ```bash
   python3 dev-container.py test-matrix --backend supabase_rest
   python3 dev-container.py test-matrix --backend supabase_postgres
   ```
4. **Review Results** and optimize configuration
5. **Deploy DBAL Daemon** with Supabase backend to production

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase REST API](https://supabase.com/docs/guides/api)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
