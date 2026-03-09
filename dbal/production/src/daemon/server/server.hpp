/**
 * @file server.hpp
 * @brief HTTP Server class - thin wrapper importing micro-functions
 */

#pragma once

#include <string>
#include <thread>
#include <atomic>
#include <iostream>

// Socket functions
#include "socket/socket_types.hpp"
#include "socket/operations/lifecycle/socket_create.hpp"
#include "socket/config/socket_set_reuse_addr.hpp"
#include "socket/operations/socket_bind.hpp"
#include "socket/operations/socket_listen.hpp"
#include "socket/operations/socket_accept.hpp"
#include "socket/config/socket_set_timeout.hpp"
#include "socket/operations/socket_send.hpp"
#include "socket/operations/lifecycle/socket_close.hpp"
#include "socket/config/socket_get_last_error.hpp"
#include "socket/config/winsock_init.hpp"

// HTTP types
#include "request/http_request.hpp"
#include "response/http_response.hpp"

// Response functions
#include "response/response_serialize.hpp"

// Request parsing
#include "parsing/parse_request_line.hpp"
#include "validation_internal/validate_request_path.hpp"
#include "validation_internal/validate_header.hpp"
#include "validation_internal/validate_content_length.hpp"
#include "validation_internal/validate_transfer_encoding.hpp"
#include "parsing/trim_string.hpp"
#include "parsing/to_lowercase.hpp"

// Request processing
#include "handlers/process_health_check.hpp"
#include "handlers/process_version.hpp"
#include "handlers/process_status.hpp"
#include "handlers/process_not_found.hpp"

namespace dbal {
namespace daemon {

/**
 * @class Server
 * @brief HTTP/1.1 server with nginx reverse proxy support
 */
class Server {
public:
    Server(const std::string& bind_address, int port)
        : bind_address_(bind_address), port_(port), running_(false), 
          server_fd_(INVALID_SOCKET_VALUE), active_connections_(0) {
        winsock_init();
    }
    
    ~Server() {
        stop();
        winsock_cleanup();
    }
    
    bool start();
    void stop();
    bool isRunning() const { return running_; }
    std::string address() const { return bind_address_ + ":" + std::to_string(port_); }
    
private:
    void acceptLoop();
    void handleConnection(socket_t client_fd);
    bool parseRequest(socket_t client_fd, HttpRequest& request, HttpResponse& error_response);
    HttpResponse processRequest(const HttpRequest& request);
    
    std::string bind_address_;
    int port_;
    bool running_;
    socket_t server_fd_;
    std::thread accept_thread_;
    std::atomic<size_t> active_connections_;
};

// Implementation in server_impl.hpp

} // namespace daemon
} // namespace dbal
