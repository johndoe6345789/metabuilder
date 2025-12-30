/**
 * @file socket_set_reuse_addr.hpp
 * @brief Set SO_REUSEADDR socket option
 */

#pragma once

#include <iostream>
#include "socket_types.hpp"
#include "socket_get_last_error.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Set SO_REUSEADDR option on socket
 * @param fd Socket handle
 * @return true on success
 */
inline bool socket_set_reuse_addr(socket_t fd) {
    int opt = 1;
#ifdef _WIN32
    char* opt_ptr = reinterpret_cast<char*>(&opt);
#else
    void* opt_ptr = &opt;
#endif
    if (setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, opt_ptr, sizeof(opt)) < 0) {
        std::cerr << "Failed to set SO_REUSEADDR: " << socket_get_last_error() << std::endl;
        return false;
    }
    return true;
}

} // namespace daemon
} // namespace dbal
