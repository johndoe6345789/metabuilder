/**
 * @file socket_set_timeout.hpp
 * @brief Set socket receive/send timeouts
 */

#pragma once

#include "../socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Set socket receive and send timeouts
 * @param fd Socket handle
 * @param timeout_seconds Timeout in seconds
 */
inline void socket_set_timeout(socket_t fd, int timeout_seconds = 30) {
#ifdef _WIN32
    DWORD timeout = timeout_seconds * 1000; // milliseconds
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeout, sizeof(timeout));
#else
    struct timeval timeout;
    timeout.tv_sec = timeout_seconds;
    timeout.tv_usec = 0;
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
#endif
}

} // namespace daemon
} // namespace dbal
