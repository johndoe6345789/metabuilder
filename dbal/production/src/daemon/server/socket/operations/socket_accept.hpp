/**
 * @file socket_accept.hpp
 * @brief Accept incoming connection
 */

#pragma once

#include <cstring>
#include "socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Accept incoming connection
 * @param server_fd Server socket handle
 * @return Client socket handle or INVALID_SOCKET_VALUE on error
 */
inline socket_t socket_accept(socket_t server_fd) {
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    
    return accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
}

} // namespace daemon
} // namespace dbal
