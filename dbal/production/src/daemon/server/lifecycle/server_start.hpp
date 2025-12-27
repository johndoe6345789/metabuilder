/**
 * @file server_start.hpp
 * @brief Server start implementation
 */

#pragma once

#include "server.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Start the server
 */
inline bool Server::start() {
    if (running_) return false;
    
    // Create socket
    server_fd_ = socket_create();
    if (server_fd_ == INVALID_SOCKET_VALUE) {
        return false;
    }
    
    // Set socket options
    if (!socket_set_reuse_addr(server_fd_)) {
        socket_close(server_fd_);
        server_fd_ = INVALID_SOCKET_VALUE;
        return false;
    }
    
    // Bind to address
    if (!socket_bind(server_fd_, bind_address_, port_)) {
        socket_close(server_fd_);
        server_fd_ = INVALID_SOCKET_VALUE;
        return false;
    }
    
    // Listen
    if (!socket_listen(server_fd_)) {
        socket_close(server_fd_);
        server_fd_ = INVALID_SOCKET_VALUE;
        return false;
    }
    
    running_ = true;
    accept_thread_ = std::thread(&Server::acceptLoop, this);
    
    std::cout << "Server listening on " << bind_address_ << ":" << port_ << std::endl;
    return true;
}

} // namespace daemon
} // namespace dbal
