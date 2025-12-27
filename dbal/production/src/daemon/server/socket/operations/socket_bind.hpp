/**
 * @file socket_bind.hpp
 * @brief Bind socket to address and port
 */

#pragma once

#include <string>
#include <cstring>
#include <iostream>
#include "socket_types.hpp"
#include "socket_get_last_error.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Bind socket to address and port
 * @param fd Socket handle
 * @param address Bind address (e.g., "0.0.0.0")
 * @param port Port number
 * @return true on success
 */
inline bool socket_bind(socket_t fd, const std::string& address, int port) {
    struct sockaddr_in addr;
    std::memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    
    if (address == "0.0.0.0" || address == "::") {
        addr.sin_addr.s_addr = INADDR_ANY;
    } else {
#ifdef _WIN32
        if (InetPton(AF_INET, address.c_str(), &addr.sin_addr) <= 0) {
            std::cerr << "Invalid bind address: " << address << std::endl;
            return false;
        }
#else
        if (inet_pton(AF_INET, address.c_str(), &addr.sin_addr) <= 0) {
            std::cerr << "Invalid bind address: " << address << std::endl;
            return false;
        }
#endif
    }
    
    if (bind(fd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        std::cerr << "Failed to bind to " << address << ":" << port 
                 << ": " << socket_get_last_error() << std::endl;
        return false;
    }
    
    return true;
}

} // namespace daemon
} // namespace dbal
