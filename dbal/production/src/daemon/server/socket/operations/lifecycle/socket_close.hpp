/**
 * @file socket_close.hpp
 * @brief Close socket
 */

#pragma once

#include "socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Close socket
 * @param fd Socket handle
 */
inline void socket_close(socket_t fd) {
    if (fd != INVALID_SOCKET_VALUE) {
        CLOSE_SOCKET(fd);
    }
}

} // namespace daemon
} // namespace dbal
