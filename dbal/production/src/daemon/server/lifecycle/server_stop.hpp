/**
 * @file server_stop.hpp
 * @brief Server stop implementation
 */

#pragma once

#include "../server.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Stop the server
 */
inline void Server::stop() {
    if (!running_) return;
    
    running_ = false;
    
    // Close server socket to unblock accept()
    socket_close(server_fd_);
    server_fd_ = INVALID_SOCKET_VALUE;
    
    // Wait for accept thread to finish
    if (accept_thread_.joinable()) {
        accept_thread_.join();
    }
    
    std::cout << "Server stopped" << std::endl;
}

} // namespace daemon
} // namespace dbal
