/**
 * @file server_handle_connection.hpp
 * @brief Server connection handler implementation
 */

#pragma once

#include "../server.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Handle a single client connection
 */
inline void Server::handleConnection(socket_t client_fd) {
    socket_set_timeout(client_fd, 30);
    
    HttpRequest request;
    HttpResponse response;
    
    if (!parseRequest(client_fd, request, response)) {
        if (response.status_code != 200) {
            std::string response_str = response_serialize(response);
            socket_send(client_fd, response_str);
        }
        socket_close(client_fd);
        active_connections_--;
        return;
    }
    
    response = processRequest(request);
    
    std::string response_str = response_serialize(response);
    socket_send(client_fd, response_str);
    
    socket_close(client_fd);
    active_connections_--;
}

} // namespace daemon
} // namespace dbal
