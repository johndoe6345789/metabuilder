# Cross-Platform Build Guide

The DBAL daemon is designed to work across multiple platforms and compilers:
- **Windows**: MSVC (Visual Studio 2017+)
- **Linux**: GCC 7+ / Clang 6+
- **macOS**: XCode 10+ (Clang)

## Platform Support

### Windows (MSVC)

**Requirements:**
- Visual Studio 2017 or later
- CMake 3.20+
- Ninja (optional, recommended)

**Build Commands:**
```cmd
# Using Visual Studio Developer Command Prompt
mkdir build
cd build
cmake -G "Visual Studio 16 2019" -A x64 ..
cmake --build . --config Release

# Or with Ninja
cmake -G Ninja -DCMAKE_BUILD_TYPE=Release ..
ninja
```

**Run:**
```cmd
cd build\dbal\cpp\src\daemon\Release
dbal_daemon.exe --bind 127.0.0.1 --port 8080
```

**Notes:**
- Winsock2 is automatically linked (ws2_32.lib)
- Uses `InetPton` for address parsing (requires Windows Vista+)
- Signal handling uses SIGINT and SIGBREAK (mapped to SIGTERM)
- Timeout values are in milliseconds (vs. seconds on POSIX)

### Linux (GCC/Clang)

**Requirements:**
- GCC 7+ or Clang 6+
- CMake 3.20+
- Ninja (optional, recommended)
- POSIX-compliant system

**Build Commands:**
```bash
mkdir build
cd build
cmake -G Ninja -DCMAKE_BUILD_TYPE=Release ..
ninja

# Or with Unix Makefiles
cmake -DCMAKE_BUILD_TYPE=Release ..
make -j$(nproc)
```

**Run:**
```bash
./dbal_daemon --bind 127.0.0.1 --port 8080
```

**Notes:**
- Uses POSIX sockets (sys/socket.h)
- Standard signal handling (SIGINT, SIGTERM)
- Uses `inet_pton` for address parsing
- Timeout values use `struct timeval`

### macOS (XCode/Clang)

**Requirements:**
- XCode 10+ (Command Line Tools sufficient)
- CMake 3.20+
- Ninja (optional, install via Homebrew)

**Build Commands:**
```bash
# With XCode project
mkdir build
cd build
cmake -G Xcode ..
xcodebuild -configuration Release

# With Ninja (recommended)
cmake -G Ninja -DCMAKE_BUILD_TYPE=Release ..
ninja

# With Unix Makefiles
cmake -DCMAKE_BUILD_TYPE=Release ..
make -j$(sysctl -n hw.ncpu)
```

**Run:**
```bash
./dbal_daemon --bind 127.0.0.1 --port 8080
```

**Notes:**
- Uses BSD sockets (POSIX-compatible)
- Standard signal handling
- Same as Linux for most socket operations

## Cross-Platform Implementation Details

### Socket API

The daemon uses conditional compilation to handle platform differences:

**Windows (Winsock2):**
- `SOCKET` type (unsigned integer)
- `INVALID_SOCKET` constant
- `closesocket()` function
- `WSAStartup()`/`WSACleanup()` initialization
- `WSAGetLastError()` for error codes
- Timeout in milliseconds (`DWORD`)

**POSIX (Linux/macOS):**
- `int` socket descriptor
- `-1` for invalid socket
- `close()` function
- No initialization needed
- `errno` + `strerror()` for errors
- Timeout with `struct timeval`

### Code Abstractions

```cpp
#ifdef _WIN32
    typedef SOCKET socket_t;
    #define CLOSE_SOCKET closesocket
    #define INVALID_SOCKET_VALUE INVALID_SOCKET
#else
    typedef int socket_t;
    #define CLOSE_SOCKET close
    #define INVALID_SOCKET_VALUE -1
#endif
```

### Signal Handling

**Windows:**
- SIGINT supported (Ctrl+C)
- SIGTERM mapped to SIGBREAK
- Limited signal support compared to POSIX

**POSIX:**
- Full POSIX signal support
- SIGINT (Ctrl+C)
- SIGTERM (graceful shutdown)
- SIGHUP (reload configuration - not yet implemented)

## Testing

### Windows
```cmd
# Build
cmake -G Ninja -DCMAKE_BUILD_TYPE=Release ..
ninja

# Run tests
ctest --output-on-failure

# Start daemon
dbal_daemon.exe

# Test endpoints (PowerShell)
Invoke-WebRequest http://127.0.0.1:8080/health
Invoke-WebRequest http://127.0.0.1:8080/version
```

### Linux/macOS
```bash
# Build
cmake -G Ninja -DCMAKE_BUILD_TYPE=Release ..
ninja

# Run tests
ctest --output-on-failure

# Start daemon
./dbal_daemon

# Test endpoints
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/version
```

## CI/CD Integration

### GitHub Actions

The repository includes workflows for all platforms:

**.github/workflows/cpp-build.yml:**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    include:
      - os: ubuntu-latest
        compiler: gcc
      - os: macos-latest
        compiler: clang
      - os: windows-latest
        compiler: msvc
```

### Platform-Specific Build Steps

**Ubuntu (GCC):**
```yaml
- name: Configure
  run: cmake -G Ninja -DCMAKE_BUILD_TYPE=Release .
- name: Build
  run: ninja
```

**macOS (Clang):**
```yaml
- name: Configure
  run: cmake -G Ninja -DCMAKE_BUILD_TYPE=Release .
- name: Build
  run: ninja
```

**Windows (MSVC):**
```yaml
- name: Configure
  run: cmake -G "Visual Studio 16 2019" -A x64 .
- name: Build
  run: cmake --build . --config Release
```

## Common Build Issues

### Windows

**Issue:** `winsock2.h` not found
- **Solution:** Install Windows SDK or use Visual Studio

**Issue:** LNK2019 unresolved external symbols (WSA*)
- **Solution:** Ensure `#pragma comment(lib, "ws2_32.lib")` is included

**Issue:** `inet_pton` undefined
- **Solution:** Requires Windows Vista+ / Windows Server 2008+

### Linux

**Issue:** `sys/socket.h` not found
- **Solution:** Install build essentials: `sudo apt-get install build-essential`

**Issue:** Address already in use
- **Solution:** Use `SO_REUSEADDR` (already implemented) or wait for TIME_WAIT

### macOS

**Issue:** XCode command line tools not found
- **Solution:** `xcode-select --install`

**Issue:** CMake not found
- **Solution:** `brew install cmake ninja`

## Performance Considerations

### Thread Model

The daemon uses a thread-per-connection model:
- Simple and reliable
- Good for moderate load (<1000 concurrent connections)
- Consider thread pool for high-concurrency scenarios

### Platform Differences

**Windows:**
- Slightly higher overhead per thread
- Consider I/O completion ports for production

**Linux:**
- Efficient thread handling with native POSIX threads
- Consider epoll for high-concurrency

**macOS:**
- Similar to Linux (BSD kqueue)
- Good native threading support

## Production Deployment

### Recommended Setup

**All Platforms:**
```
Internet → Nginx (SSL termination, load balancing)
         → DBAL Daemon (localhost:8080)
```

**Benefits:**
- SSL/TLS handled by Nginx
- Load balancing across multiple daemon instances
- Health check integration
- Request buffering and rate limiting

### Nginx Configuration

Same configuration works on all platforms:

```nginx
upstream dbal_backend {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://dbal_backend/;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        proxy_set_header Connection "";
    }
}
```

## Troubleshooting

### Check Platform Detection

Add to CMakeLists.txt:
```cmake
if(WIN32)
    message(STATUS "Building for Windows")
elseif(APPLE)
    message(STATUS "Building for macOS")
elseif(UNIX)
    message(STATUS "Building for Linux/Unix")
endif()
```

### Debug Socket Issues

Enable verbose error messages:
```cpp
std::cerr << "Socket error: " << getLastErrorString() << std::endl;
```

### Test Connectivity

**Windows:**
```cmd
netstat -an | findstr :8080
telnet 127.0.0.1 8080
```

**Linux/macOS:**
```bash
netstat -an | grep :8080
nc -zv 127.0.0.1 8080
```

## Summary

The DBAL daemon is fully cross-platform with:
- ✅ Windows MSVC support with Winsock2
- ✅ Linux GCC/Clang support with POSIX sockets
- ✅ macOS XCode/Clang support with BSD sockets
- ✅ Consistent API across all platforms
- ✅ Same nginx configuration for all platforms
- ✅ CI/CD tested on all platforms

For more details, see `NGINX_INTEGRATION.md` for deployment and `CMakeLists.txt` for build configuration.
