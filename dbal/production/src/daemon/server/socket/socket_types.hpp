/**
 * @file socket_types.hpp
 * @brief Cross-platform socket type definitions
 */

#pragma once

#ifdef _WIN32
    #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
    #endif
    #include <windows.h>
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
    
    typedef SOCKET socket_t;
    typedef int socklen_t;
    #define CLOSE_SOCKET closesocket
    #define INVALID_SOCKET_VALUE INVALID_SOCKET
    #define SOCKET_ERROR_VALUE SOCKET_ERROR
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #include <fcntl.h>
    #include <errno.h>
    
    typedef int socket_t;
    #define CLOSE_SOCKET close
    #define INVALID_SOCKET_VALUE -1
    #define SOCKET_ERROR_VALUE -1
#endif

namespace dbal {
namespace daemon {

// Security limits to prevent CVE-style attacks
constexpr size_t MAX_REQUEST_SIZE = 65536;           // 64KB max request
constexpr size_t MAX_HEADERS = 100;                   // Max 100 headers
constexpr size_t MAX_HEADER_SIZE = 8192;              // 8KB max per header
constexpr size_t MAX_PATH_LENGTH = 2048;              // Max URL path length
constexpr size_t MAX_BODY_SIZE = 10485760;            // 10MB max body size
constexpr size_t MAX_CONCURRENT_CONNECTIONS = 1000;   // Prevent thread exhaustion

} // namespace daemon
} // namespace dbal
