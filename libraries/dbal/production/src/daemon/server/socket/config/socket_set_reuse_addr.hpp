/**
 * @file socket_set_reuse_addr.hpp
 * @brief Set SO_REUSEADDR socket option
 */

#pragma once

#include <iostream>
#include "../socket_types.hpp"
#include "socket_get_last_error.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Set SO_REUSEADDR option on socket
 * @param fd Socket handle
 * @return true on success
 */
inline bool socket_set_reuse_addr(socket_t fd) {
    const int opt = 1;
#ifdef _WIN32
    if (setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<const char*>(&opt), sizeof(opt)) < 0) {
#else
    if (setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
#endif
        std::cerr << "Failed to set SO_REUSEADDR: " << socket_get_last_error() << std::endl;
        return false;
    }
    return true;
}

} // namespace daemon
} // namespace dbal
