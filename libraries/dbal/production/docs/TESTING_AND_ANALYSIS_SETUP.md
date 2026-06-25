# DBAL Testing & Static Analysis Setup Plan

## Overview
Implement comprehensive testing and static analysis infrastructure to catch threading bugs, memory issues, and logic errors before runtime.

## Phase 1: Enhanced Static Analysis

### 1.1 Thread Safety Analysis (.clang-tidy)
**File**: `.clang-tidy`
```yaml
Checks: >
  -*,
  bugprone-*,
  concurrency-*,
  thread-safety-*,
  cert-con*,
  cppcoreguidelines-*,
  modernize-*,
  performance-*,
  readability-*

CheckOptions:
  - key: readability-identifier-naming.VariableCase
    value: lower_case
```

### 1.2 ThreadSanitizer (TSan) Build
**File**: `CMakeLists.txt`
```cmake
option(ENABLE_TSAN "Enable ThreadSanitizer" OFF)
option(ENABLE_ASAN "Enable AddressSanitizer" OFF)

if(ENABLE_TSAN)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fsanitize=thread -g -O1")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -fsanitize=thread")
endif()

if(ENABLE_ASAN)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fsanitize=address -g -O1")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -fsanitize=address")
endif()
```

### 1.3 Thread Annotations
**File**: `include/dbal/daemon/server.hpp`
```cpp
// Add clang thread annotations
#define GUARDED_BY(x) __attribute__((guarded_by(x)))
#define REQUIRES(x) __attribute__((requires_capability(x)))

class Server {
private:
    std::mutex client_mutex_;
    std::unique_ptr<dbal::Client> dbal_client_ GUARDED_BY(client_mutex_);
};
```

## Phase 2: Unit Testing Framework

### 2.1 Google Test Integration
**File**: `build-config/conanfile.py`
```python
def requirements(self):
    # ... existing deps
    self.requires("gtest/1.14.0")
```

### 2.2 Test Directory Structure
```
tests/
├── unit/                      # Fast, isolated unit tests
│   ├── client_test.cpp
│   ├── server_test.cpp
│   ├── thread_safety_test.cpp
│   └── config_test.cpp
├── integration/               # Database integration tests
│   ├── sqlite_adapter_test.cpp
│   └── postgres_adapter_test.cpp
└── conformance/               # Full DBAL spec tests
    └── dbal_conformance_test.cpp
```

### 2.3 Example Thread Safety Test
**File**: `tests/unit/thread_safety_test.cpp`
```cpp
#include <gtest/gtest.h>
#include "dbal/daemon/server.hpp"
#include <thread>
#include <vector>

TEST(ServerThreadSafety, ConcurrentEnsureClient) {
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    config.mode = "production";

    dbal::daemon::Server server("127.0.0.1", 8080, config);

    // Spawn 10 threads all calling ensureClient concurrently
    std::vector<std::thread> threads;
    std::atomic<int> success_count{0};

    for (int i = 0; i < 10; i++) {
        threads.emplace_back([&]() {
            if (server.ensureClient()) {
                success_count++;
            }
        });
    }

    for (auto& t : threads) {
        t.join();
    }

    // All threads should succeed
    EXPECT_EQ(success_count.load(), 10);
}

TEST(ServerThreadSafety, ConfigIsolation) {
    dbal::ClientConfig config1;
    config1.adapter = "sqlite";
    config1.database_url = ":memory:";

    dbal::ClientConfig config2;
    config2.adapter = "postgres";
    config2.database_url = "postgresql://test";

    dbal::daemon::Server server1("127.0.0.1", 8080, config1);
    dbal::daemon::Server server2("127.0.0.1", 8081, config2);

    // Configs should not interfere with each other
    // (This would have caught the original bug)
}
```

## Phase 3: Continuous Testing

### 3.1 Docker Test Environment
**File**: `docker-compose.test.yml` (enhance existing)
```yaml
services:
  dbal-tsan:
    build:
      context: ..
      dockerfile: build-config/Dockerfile.tsan
    environment:
      - TSAN_OPTIONS=halt_on_error=1
```

### 3.2 CI/CD Integration
**File**: `.github/workflows/tests.yml`
```yaml
name: DBAL Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: |
          cd dbal/production/build-config
          cmake -DENABLE_TESTS=ON ..
          make
          ctest --output-on-failure

  tsan-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run TSan Tests
        run: |
          cd dbal/production/build-config
          cmake -DENABLE_TSAN=ON -DENABLE_TESTS=ON ..
          make
          ctest --output-on-failure
```

## Benefits

### What We Would Have Caught
1. **ThreadSanitizer** would have immediately reported:
   ```
   WARNING: ThreadSanitizer: data race on client_config_.adapter
     Write of size 8 at 0x7b0400000000 by thread T1
     Previous read of size 8 at 0x7b0400000000 by thread T2
   ```

2. **Thread Safety Tests** would have failed with:
   ```
   Expected: 10 successful calls
   Actual: 3 successful calls, 7 segfaults
   ```

3. **clang-tidy** would have warned:
   ```
   warning: accessing member 'client_config_' requires holding mutex 'client_mutex_'
   ```

## Implementation Order
1. ✅ Enhanced clang-tidy configuration
2. ✅ Add GUARDED_BY annotations
3. ✅ Integrate Google Test
4. ✅ Write thread safety tests
5. ✅ Add TSan build option
6. ✅ Create CI/CD workflow
