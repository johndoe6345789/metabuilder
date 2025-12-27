/**
 * @file server_accept_loop.hpp
 * @brief Server accept loop implementation
 */

#pragma once

#include "server.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Accept loop - runs in separate thread
 */
inline void Server::acceptLoop() {
    while (running_) {
        socket_t client_fd = socket_accept(server_fd_);
        
        if (client_fd == INVALID_SOCKET_VALUE) {
            if (running_) {
                std::cerr << "Accept failed: " << socket_get_last_error() << std::endl;
            }
            continue;
        }
        
        // Check connection limit to prevent thread exhaustion DoS
        size_t prev_count = active_connections_.fetch_add(1);
        if (prev_count >= MAX_CONCURRENT_CONNECTIONS) {
            std::cerr << "Connection limit reached, rejecting connection" << std::endl;
            active_connections_--;
            socket_close(client_fd);
            continue;
        }
        
        // Handle connection in a new thread
        std::thread(&Server::handleConnection, this, client_fd).detach();
    }
}

} // namespace daemon
} // namespace dbal
