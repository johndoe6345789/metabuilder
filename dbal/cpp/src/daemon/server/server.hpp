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
#include "socket_types.hpp"
#include "socket_create.hpp"
#include "socket_set_reuse_addr.hpp"
#include "socket_bind.hpp"
#include "socket_listen.hpp"
#include "socket_accept.hpp"
#include "socket_set_timeout.hpp"
#include "socket_send.hpp"
#include "socket_close.hpp"
#include "socket_get_last_error.hpp"
#include "winsock_init.hpp"

// HTTP types
#include "http_request.hpp"
#include "http_response.hpp"

// Response functions
#include "response_serialize.hpp"

// Request parsing
#include "parse_request_line.hpp"
#include "validate_request_path.hpp"
#include "validate_header.hpp"
#include "validate_content_length.hpp"
#include "validate_transfer_encoding.hpp"
#include "trim_string.hpp"
#include "to_lowercase.hpp"

// Request processing
#include "process_health_check.hpp"
#include "process_version.hpp"
#include "process_status.hpp"
#include "process_not_found.hpp"

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
