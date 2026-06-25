/**
 * @file socket_utils.hpp
 * @brief Cross-platform socket utilities
 * 
 * Provides platform-agnostic socket operations for Windows and POSIX systems.
 */
#ifndef DBAL_SOCKET_UTILS_HPP
#define DBAL_SOCKET_UTILS_HPP

#include <string>
#include <cstring>

// Cross-platform socket headers
#ifdef _WIN32
    #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
    #endif
    #include <windows.h>
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
    
    // Windows socket type aliases
    typedef SOCKET socket_t;
    typedef int socklen_t;
    #define CLOSE_SOCKET closesocket
    #define INVALID_SOCKET_VALUE INVALID_SOCKET
    #define SOCKET_ERROR_VALUE SOCKET_ERROR
#else
    // POSIX (Linux, macOS, Unix)
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #include <fcntl.h>
    #include <errno.h>
    
    // POSIX socket type aliases
    typedef int socket_t;
    #define CLOSE_SOCKET close
    #define INVALID_SOCKET_VALUE -1
    #define SOCKET_ERROR_VALUE -1
#endif

namespace dbal {
namespace daemon {
namespace socket_utils {

/**
 * Initialize socket subsystem (required on Windows)
 * @return true if initialization succeeded
 */
inline bool initialize() {
#ifdef _WIN32
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    return result == 0;
#else
    return true;
#endif
}

/**
 * Cleanup socket subsystem (required on Windows)
 */
inline void cleanup() {
#ifdef _WIN32
    WSACleanup();
#endif
}

/**
 * Get last socket error as string
 */
inline std::string getLastErrorString() {
#ifdef _WIN32
    int error = WSAGetLastError();
    char* message = nullptr;
    FormatMessageA(
        FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
        nullptr, error, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
        (LPSTR)&message, 0, nullptr);
    std::string result = message ? message : "Unknown error";
    if (message) LocalFree(message);
    return result;
#else
    return strerror(errno);
#endif
}

/**
 * Set socket receive/send timeouts
 * @param fd Socket file descriptor
 * @param timeout_sec Timeout in seconds
 */
inline void setSocketTimeout(socket_t fd, int timeout_sec) {
#ifdef _WIN32
    DWORD timeout = timeout_sec * 1000; // Convert to milliseconds
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeout, sizeof(timeout));
#else
    struct timeval timeout;
    timeout.tv_sec = timeout_sec;
    timeout.tv_usec = 0;
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
#endif
}

/**
 * Parse bind address into sockaddr_in
 * @param address Address string (e.g., "0.0.0.0" or "127.0.0.1")
 * @param port Port number
 * @param addr Output sockaddr_in structure
 * @return true if parsing succeeded
 */
inline bool parseBindAddress(const std::string& address, int port, struct sockaddr_in& addr) {
    std::memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    
    if (address == "0.0.0.0" || address == "::") {
        addr.sin_addr.s_addr = INADDR_ANY;
        return true;
    }
    
#ifdef _WIN32
    return InetPtonA(AF_INET, address.c_str(), &addr.sin_addr) > 0;
#else
    return inet_pton(AF_INET, address.c_str(), &addr.sin_addr) > 0;
#endif
}

} // namespace socket_utils
} // namespace daemon
} // namespace dbal

#endif
