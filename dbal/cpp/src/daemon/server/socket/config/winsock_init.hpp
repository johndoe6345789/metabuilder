/**
 * @file winsock_init.hpp
 * @brief Windows socket initialization
 */

#pragma once

#include <iostream>
#include "socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Initialize Windows sockets (no-op on other platforms)
 * @return true on success
 */
inline bool winsock_init() {
#ifdef _WIN32
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        std::cerr << "WSAStartup failed: " << result << std::endl;
        return false;
    }
#endif
    return true;
}

/**
 * @brief Cleanup Windows sockets (no-op on other platforms)
 */
inline void winsock_cleanup() {
#ifdef _WIN32
    WSACleanup();
#endif
}

} // namespace daemon
} // namespace dbal
