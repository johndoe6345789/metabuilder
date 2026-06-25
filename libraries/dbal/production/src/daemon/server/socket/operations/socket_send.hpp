/**
 * @file socket_send.hpp
 * @brief Send data on socket
 */

#pragma once

#include <string>
#include "../socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Send data on socket
 * @param fd Socket handle
 * @param data Data to send
 * @return Number of bytes sent or -1 on error
 */
inline int socket_send(socket_t fd, const std::string& data) {
    return send(fd, data.c_str(), data.length(), 0);
}

} // namespace daemon
} // namespace dbal
