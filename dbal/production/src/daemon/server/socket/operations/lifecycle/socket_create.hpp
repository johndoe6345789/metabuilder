/**
 * @file socket_create.hpp
 * @brief Create server socket
 */

#pragma once

#include <iostream>
#include "socket_types.hpp"
#include "socket_get_last_error.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Create a TCP server socket
 * @return Socket handle or INVALID_SOCKET_VALUE on error
 */
inline socket_t socket_create() {
    socket_t fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd == INVALID_SOCKET_VALUE) {
        std::cerr << "Failed to create socket: " << socket_get_last_error() << std::endl;
    }
    return fd;
}

} // namespace daemon
} // namespace dbal
