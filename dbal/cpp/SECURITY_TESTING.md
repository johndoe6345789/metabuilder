# HTTP Server Security Testing Guide

## Overview

This document provides instructions for testing the security improvements made to the HTTP server in `dbal/cpp/src/daemon/server.cpp`.

## Security Fixes Implemented

The server now protects against the following CVE patterns:

1. **CVE-2024-1135** - Request Smuggling via Multiple Content-Length
2. **CVE-2024-40725** - Request Smuggling via Header Parsing
3. **CVE-2024-23452** - Transfer-Encoding + Content-Length Smuggling
4. **CVE-2024-22087** - Buffer Overflow
5. **CVE-2024-53868** - Chunked Encoding Vulnerabilities

## Running Security Tests

### Method 1: Automated Test Suite

```bash
cd dbal/cpp
mkdir -p build && cd build
cmake ..
make -j4

# Start the daemon
./dbal_daemon --port 8080 --daemon &

# Run security tests
./http_server_security_test 127.0.0.1 8080
```

### Method 2: Manual Testing with netcat

The following tests can be run manually using `nc` (netcat):

#### Test 1: Duplicate Content-Length (CVE-2024-1135)

```bash
echo -ne "POST /api/status HTTP/1.1\r\nHost: localhost\r\nContent-Length: 6\r\nContent-Length: 100\r\n\r\n" | nc 127.0.0.1 8080
```

**Expected**: HTTP 400 Bad Request with error message about multiple Content-Length headers

#### Test 2: Transfer-Encoding + Content-Length (CVE-2024-23452)

```bash
echo -ne "POST /api/status HTTP/1.1\r\nHost: localhost\r\nTransfer-Encoding: chunked\r\nContent-Length: 100\r\n\r\n" | nc 127.0.0.1 8080
```

**Expected**: HTTP 400 Bad Request (both headers present) or HTTP 501 Not Implemented (Transfer-Encoding)

#### Test 3: Integer Overflow in Content-Length

```bash
echo -ne "POST /api/status HTTP/1.1\r\nHost: localhost\r\nContent-Length: 9999999999999999999\r\n\r\n" | nc 127.0.0.1 8080
```

**Expected**: HTTP 413 Request Entity Too Large

#### Test 4: Oversized Request

```bash
python3 -c "print('GET /' + 'A'*70000 + ' HTTP/1.1\r\nHost: localhost\r\n\r\n')" | nc 127.0.0.1 8080
```

**Expected**: HTTP 413 Request Entity Too Large

#### Test 5: Header Bomb

```bash
{
  echo -ne "GET /api/status HTTP/1.1\r\nHost: localhost\r\n"
  for i in {1..150}; do
    echo -ne "X-Header-$i: value\r\n"
  done
  echo -ne "\r\n"
} | nc 127.0.0.1 8080
```

**Expected**: HTTP 431 Request Header Fields Too Large

#### Test 6: Normal Health Check (Should Work)

```bash
echo -ne "GET /health HTTP/1.1\r\nHost: localhost\r\n\r\n" | nc 127.0.0.1 8080
```

**Expected**: HTTP 200 OK with JSON response `{"status":"healthy","service":"dbal"}`

## Security Limits

The following limits are enforced by the server:

```cpp
const size_t MAX_REQUEST_SIZE = 65536;           // 64KB max request
const size_t MAX_HEADERS = 100;                   // Max 100 headers
const size_t MAX_HEADER_SIZE = 8192;              // 8KB max per header
const size_t MAX_PATH_LENGTH = 2048;              // Max URL path length
const size_t MAX_BODY_SIZE = 10485760;            // 10MB max body size
const size_t MAX_CONCURRENT_CONNECTIONS = 1000;   // Max concurrent connections
```

These can be adjusted in `server.cpp` if needed for your use case.

## Error Responses

The server returns appropriate HTTP status codes for security violations:

- **400 Bad Request**: Malformed requests, duplicate headers, CRLF injection, null bytes
- **413 Request Entity Too Large**: Request exceeds size limits
- **414 URI Too Long**: Path exceeds MAX_PATH_LENGTH
- **431 Request Header Fields Too Large**: Too many headers or header too large
- **501 Not Implemented**: Transfer-Encoding (chunked) not supported

## Monitoring Security Events

In production, you should monitor for:

1. **High rate of 4xx errors** - May indicate attack attempts
2. **Connection limit reached** - Potential DoS attack
3. **Repeated 431 errors** - Header bomb attempts
4. **Repeated 413 errors** - Large payload attacks

Add logging to track these events:

```cpp
std::cerr << "Security violation: " << error_code << " from " << client_ip << std::endl;
```

## Integration with nginx

When running behind nginx reverse proxy, nginx provides additional protection:

```nginx
# nginx.conf
http {
    # Request size limits
    client_max_body_size 10m;
    client_header_buffer_size 8k;
    large_client_header_buffers 4 16k;
    
    # Timeouts
    client_body_timeout 30s;
    client_header_timeout 30s;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        location /api/ {
            limit_req zone=api burst=20;
            
            proxy_pass http://127.0.0.1:8080/;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
        }
    }
}
```

This provides defense in depth - nginx catches many attacks before they reach the application.

## Compliance

After implementing these fixes, the server complies with:

- **RFC 7230** (HTTP/1.1 Message Syntax and Routing)
- **OWASP HTTP Server Security Guidelines**
- **CWE-444** (Inconsistent Interpretation of HTTP Requests)
- **CWE-119** (Buffer Overflow)
- **CWE-400** (Uncontrolled Resource Consumption)

## Further Reading

- [CVE-2024-1135 Analysis](https://www.cve.news/cve-2024-1135/)
- [HTTP Request Smuggling](https://portswigger.net/web-security/request-smuggling)
- [RFC 7230 - HTTP/1.1](https://tools.ietf.org/html/rfc7230)
- [OWASP HTTP Security Headers](https://owasp.org/www-project-secure-headers/)

## Reporting Security Issues

If you discover a security vulnerability in this implementation, please report it according to the guidelines in `SECURITY.md` at the repository root.
