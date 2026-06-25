# C++ Implementation Guide

## Building the DBAL Daemon

### Prerequisites

- CMake 3.20+
- C++17 compatible compiler (GCC 9+, Clang 10+, MSVC 2019+)
- SQLite3 development libraries
- Drogon HTTP framework (via Conan or system package manager)
- Optional: MongoDB C++ driver, gRPC

### Build Instructions

```bash
cd dbal/production
conan install . --output-folder=build --build=missing
cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake
cmake --build build -j$(nproc)
```

### Running Tests

```bash
# From build directory
./unit_tests
./integration_tests
./conformance_tests

# Security tests (recommended after any HTTP server changes)
./http_server_security_test
```

See [SECURITY_TESTING.md](SECURITY_TESTING.md) for comprehensive security testing guide.

### Installing

```bash
sudo make install
```

This installs:
- `/usr/local/bin/dbal_daemon` - The daemon executable
- `/usr/local/include/dbal/` - Public headers

## Daemon Architecture

### Security Model

The daemon implements **defense-in-depth security** with multiple layers:

#### HTTP Server Security (Production-Ready)

The daemon now uses **Drogon** for HTTP handling to avoid custom parsing risks and reduce CVE exposure. Drogon provides hardened HTTP parsing, request validation, and connection management out of the box.

See [CVE_ANALYSIS.md](CVE_ANALYSIS.md) and [CVE_COMPARISON_SUMMARY.md](CVE_COMPARISON_SUMMARY.md) for the legacy server analysis and migration notes.

#### Process Security

1. **Process Isolation**: Runs in separate process from application
2. **File System**: Restricted to `/var/lib/dbal/` and `/var/log/dbal/`
3. **Network**: Only connects to database, no outbound internet
4. **User**: Runs as dedicated `dbal` user (not root)
5. **Capabilities**: Only `CAP_NET_BIND_SERVICE` for port 50051

### Configuration

```yaml
# /etc/dbal/config.yaml
server:
  bind: "127.0.0.1:50051"
  tls:
    enabled: true
    cert: "/etc/dbal/certs/server.crt"
    key: "/etc/dbal/certs/server.key"

database:
  adapter: "prisma"
  url: "${DATABASE_URL}"
  pool_size: 20
  connection_timeout: 30

security:
  sandbox: "strict"
  audit_log: "/var/log/dbal/audit.log"
  max_query_time: 30
  max_result_size: 1048576

acl:
  rules_file: "/etc/dbal/acl.yaml"
  enforce_row_level: true
```

### Running the Daemon

#### Development

```bash
./dbal_daemon --config=../config/dev.yaml --mode=development
```

#### Production (systemd)

```ini
# /etc/systemd/system/dbal.service
[Unit]
Description=DBAL Daemon
After=network.target

[Service]
Type=simple
User=dbal
Group=dbal
ExecStart=/usr/local/bin/dbal_daemon --config=/etc/dbal/config.yaml
Restart=on-failure
RestartSec=5
PrivateTmp=true
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/dbal /var/log/dbal

[Install]
WantedBy=multi-user.target
```

Start the service:

```bash
sudo systemctl enable dbal
sudo systemctl start dbal
sudo systemctl status dbal
```

#### Docker

```dockerfile
# Dockerfile
FROM alpine:3.18

RUN apk add --no-cache \
    libstdc++ \
    sqlite-libs

COPY --from=builder /app/build/dbal_daemon /usr/local/bin/
COPY config/prod.yaml /etc/dbal/config.yaml

RUN adduser -D -u 1000 dbal && \
    mkdir -p /var/lib/dbal /var/log/dbal && \
    chown -R dbal:dbal /var/lib/dbal /var/log/dbal

USER dbal
EXPOSE 50051

ENTRYPOINT ["/usr/local/bin/dbal_daemon"]
CMD ["--config=/etc/dbal/config.yaml"]
```

## Code Structure

### Public API (`include/dbal/`)

**client.hpp** - Main client interface
```cpp
dbal::Client client(config);
auto result = client.createUser({
    .username = "john",
    .email = "john@example.com",
    .role = "user"
});
if (result.isOk()) {
    std::cout << "Created user: " << result.value().id << std::endl;
}
```

**errors.hpp** - Error handling with Result type
```cpp
dbal::Result<User> getUser(const std::string& id) {
    if (!exists(id)) {
        return dbal::Error::notFound("User not found");
    }
    return user;
}
```

**types.hpp** - Entity definitions (generated from YAML)

### Implementation (`src/`)

**adapters/** - Backend implementations
- `sqlite/` - Direct SQLite access
- `prisma/` - Bridge to Prisma (via RPC)
- `mongodb/` - MongoDB driver

**query/** - Query builder and optimizer
- Independent of backend
- Translates to SQL/NoSQL

**daemon/** - Daemon server
- gRPC/WebSocket server
- Authentication/ACL enforcement
- Request routing

### Testing (`tests/`)

**unit/** - Unit tests for individual components
**integration/** - Tests with real databases
**conformance/** - Cross-implementation tests

## Adding a New Adapter

1. Create header in `include/dbal/adapters/mydb/`
2. Implement in `src/adapters/mydb/`
3. Inherit from `adapters::Adapter` interface
4. Implement all CRUD methods
5. Add to CMakeLists.txt
6. Write integration tests
7. Run conformance tests

Example:

```cpp
// include/dbal/adapters/mydb/mydb_adapter.hpp
#ifndef DBAL_ADAPTERS_MYDB_ADAPTER_HPP
#define DBAL_ADAPTERS_MYDB_ADAPTER_HPP

#include "../adapter.hpp"

namespace dbal::adapters {

class MyDBAdapter : public Adapter {
public:
    explicit MyDBAdapter(const std::string& connection_string);
    
    Result<Entity> create(const std::string& entity,
                          const Json& data) override;
    Result<Entity> read(const std::string& entity,
                        const std::string& id) override;
    // ... other methods
    
private:
    MyDBConnection conn_;
};

}

#endif
```

## Debugging

### Enable Debug Logging

```bash
DBAL_LOG_LEVEL=debug ./dbal_daemon --config=config.yaml
```

### GDB Debugging

```bash
gdb ./dbal_daemon
(gdb) break dbal::Client::createUser
(gdb) run --config=dev.yaml
```

### Valgrind Memory Check

```bash
valgrind --leak-check=full ./dbal_daemon --config=config.yaml
```

## Performance Optimization

### Connection Pooling

Adjust pool size based on workload:

```yaml
database:
  pool_size: 50  # Increase for high concurrency
  min_idle: 10
  max_lifetime: 3600
```

### Query Optimization

Enable query caching:

```yaml
performance:
  query_cache: true
  cache_size_mb: 256
  cache_ttl: 300
```

### Batch Operations

Use batch APIs for bulk operations (return count of affected rows):

```cpp
std::vector<CreateUserInput> users = {...};
auto created = client.batchCreateUsers(users);

std::vector<UpdateUserBatchItem> updates = {...};
auto updated = client.batchUpdateUsers(updates);

std::vector<std::string> ids = {...};
auto deleted = client.batchDeleteUsers(ids);
```

Package equivalents are available via `batchCreatePackages`, `batchUpdatePackages`, and `batchDeletePackages`.

## Security Hardening

### 1. Run as Non-Root

```bash
sudo useradd -r -s /bin/false dbal
sudo chown -R dbal:dbal /var/lib/dbal
```

### 2. Enable SELinux/AppArmor

```bash
# SELinux policy
semanage fcontext -a -t dbal_db_t "/var/lib/dbal(/.*)?"
restorecon -R /var/lib/dbal
```

### 3. Use TLS

```yaml
server:
  tls:
    enabled: true
    cert: "/etc/dbal/certs/server.crt"
    key: "/etc/dbal/certs/server.key"
    client_auth: true  # mTLS
```

### 4. Audit Logging

```yaml
security:
  audit_log: "/var/log/dbal/audit.log"
  log_all_queries: false
  log_sensitive_operations: true
```

## Troubleshooting

### Daemon Won't Start

Check logs:
```bash
journalctl -u dbal -n 50
```

Common issues:
- Port already in use: Change `bind` in config
- Permission denied: Check file ownership
- Database unreachable: Verify `DATABASE_URL`

### High Memory Usage

Monitor with:
```bash
pmap -x $(pgrep dbal_daemon)
```

Reduce:
- Connection pool size
- Query cache size
- Result set limits

### Slow Queries

Enable query timing:
```yaml
logging:
  slow_query_threshold_ms: 1000
```

Check logs for slow queries and add indexes.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Build C++ DBAL
  run: |
    cd dbal/production
    cmake -B build -DCMAKE_BUILD_TYPE=Release
    cmake --build build --parallel

- name: Run Tests
  run: |
    cd dbal/production/build
    ctest --output-on-failure
```

### Docker Build

```bash
docker build -t dbal-daemon:latest -f dbal/production/Dockerfile .
docker push dbal-daemon:latest
```

## Monitoring

### Prometheus Metrics

Expose metrics on `:9090/metrics`:

```
dbal_queries_total{entity="User",operation="create"} 1234
dbal_query_duration_seconds{entity="User",operation="create",quantile="0.99"} 0.045
dbal_connection_pool_size{adapter="sqlite"} 20
dbal_connection_pool_idle{adapter="sqlite"} 15
```

### Health Checks

```bash
curl http://localhost:50051/health
# {"status": "healthy", "uptime": 3600, "connections": 15}
```

## Resources

- **API Documentation**: [docs.metabuilder.io/dbal/production](https://docs.metabuilder.io/dbal/production)
- **Examples**: [cpp/examples/](cpp/examples/)
- **Architecture**: [docs/architecture.md](../docs/architecture.md)
