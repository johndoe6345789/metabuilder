/**
 * @file socket_listen.hpp
 * @brief Start listening on socket
 */

#pragma once

#include <iostream>
#include "socket_types.hpp"
#include "socket_get_last_error.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Start listening on socket
 * @param fd Socket handle
 * @param backlog Connection backlog (default 128)
 * @return true on success
 */
inline bool socket_listen(socket_t fd, int backlog = 128) {
    if (listen(fd, backlog) < 0) {
        std::cerr << "Failed to listen: " << socket_get_last_error() << std::endl;
        return false;
    }
    return true;
}

} // namespace daemon
} // namespace dbal
