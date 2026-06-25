/**
 * @file http_server.hpp
 * @brief Refactored HTTP server using modular components
 * 
 * Cross-platform HTTP/1.1 server implementation with nginx reverse proxy support.
 * Uses modular components for parsing, handling, and socket operations.
 */
#ifndef DBAL_HTTP_SERVER_HPP
#define DBAL_HTTP_SERVER_HPP

#include "../http_types.hpp"
#include "security_limits.hpp"
#include "../request/request_parser.hpp"
#include "../request/request_handler.hpp"
#include "socket_utils.hpp"
#include <string>
#include <thread>
#include <atomic>
#include <iostream>
#include <cerrno>
#include <cstring>

namespace dbal {
namespace daemon {

namespace http {
    constexpr int LISTEN_BACKLOG = 128;
} // namespace http

/**
 * @class HttpServer
 * @brief Production-ready HTTP server with security hardening
 * 
 * Features:
 * - Cross-platform socket support (Windows/Linux/macOS)
 * - Multi-threaded request handling
 * - Nginx reverse proxy header parsing
 * - Health check endpoints
 * - Graceful shutdown
 * - Security hardening against CVE patterns
 */
class HttpServer {
public:
    HttpServer(const std::string& bind_address, int port)
        : bind_address_(bind_address), port_(port), running_(false), 
          server_fd_(INVALID_SOCKET_VALUE), active_connections_(0) {
        if (!socket_utils::initialize()) {
            std::cerr << "Failed to initialize socket subsystem" << std::endl;
        }
    }
    
    ~HttpServer() {
        stop();
        socket_utils::cleanup();
    }
    
    /**
     * Start the server
     * @return true if server started successfully
     */
    bool start() {
        if (running_) return false;
        
        // Create socket
        server_fd_ = socket(AF_INET, SOCK_STREAM, 0);
        if (server_fd_ == INVALID_SOCKET_VALUE) {
            std::cerr << "Failed to create socket: " << socket_utils::getLastErrorString() << std::endl;
            return false;
        }
        
        // Set socket options
        int opt = 1;
#ifdef _WIN32
        char* opt_ptr = reinterpret_cast<char*>(&opt);
#else
        void* opt_ptr = &opt;
#endif
        if (setsockopt(server_fd_, SOL_SOCKET, SO_REUSEADDR, opt_ptr, sizeof(opt)) < 0) {
            std::cerr << "Failed to set SO_REUSEADDR: " << socket_utils::getLastErrorString() << std::endl;
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
            return false;
        }
        
        // Bind to address
        struct sockaddr_in address;
        if (!socket_utils::parseBindAddress(bind_address_, port_, address)) {
            std::cerr << "Invalid bind address: " << bind_address_ << std::endl;
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
            return false;
        }
        
        if (bind(server_fd_, (struct sockaddr*)&address, sizeof(address)) < 0) {
            std::cerr << "Failed to bind to " << bind_address_ << ":" << port_ 
                     << ": " << socket_utils::getLastErrorString() << std::endl;
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
            return false;
        }
        
        // Listen for connections
        if (listen(server_fd_, http::LISTEN_BACKLOG) < 0) {
            std::cerr << "Failed to listen: " << socket_utils::getLastErrorString() << std::endl;
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
            return false;
        }
        
        running_ = true;
        
        // Start accept thread
        accept_thread_ = std::thread(&HttpServer::acceptLoop, this);
        
        std::cout << "Server listening on " << bind_address_ << ":" << port_ << std::endl;
        return true;
    }
    
    /**
     * Stop the server gracefully
     */
    void stop() {
        if (!running_) return;
        
        running_ = false;
        
        // Close server socket to unblock accept()
        if (server_fd_ != INVALID_SOCKET_VALUE) {
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
        }
        
        // Wait for accept thread to finish
        if (accept_thread_.joinable()) {
            accept_thread_.join();
        }
        
        std::cout << "Server stopped" << std::endl;
    }
    
    /**
     * Check if server is running
     */
    bool isRunning() const {
        return running_;
    }
    
    /**
     * Get server address string
     */
    std::string address() const {
        return bind_address_ + ":" + std::to_string(port_);
    }
    
private:
    void acceptLoop() {
        while (running_) {
            struct sockaddr_in client_addr;
            socklen_t client_len = sizeof(client_addr);
            
            socket_t client_fd = accept(server_fd_, (struct sockaddr*)&client_addr, &client_len);
            
            if (client_fd == INVALID_SOCKET_VALUE) {
                if (running_) {
                    std::cerr << "Accept failed: " << socket_utils::getLastErrorString() << std::endl;
                }
                continue;
            }
            
            // Check connection limit to prevent thread exhaustion DoS
            size_t prev_count = active_connections_.fetch_add(1, std::memory_order_acquire);
            if (prev_count >= http::MAX_CONCURRENT_CONNECTIONS) {
                std::cerr << "Connection limit reached, rejecting connection" << std::endl;
                active_connections_.fetch_sub(1, std::memory_order_release);
                CLOSE_SOCKET(client_fd);
                continue;
            }
            
            // Handle connection in a new thread
            std::thread(&HttpServer::handleConnection, this, client_fd).detach();
        }
    }
    
    void handleConnection(socket_t client_fd) {
        // Set receive timeout
        socket_utils::setSocketTimeout(client_fd, 30);

        http::HttpRequest request;
        http::HttpResponse response;

        if (!http::parseRequest(client_fd, request, response)) {
            // Send error response if one was set
            if (response.status_code != 200) {
                std::string response_str = response.serialize();
                ssize_t bytes_sent = send(client_fd, response_str.c_str(), response_str.length(), 0);
                if (bytes_sent < 0) {
                    std::cerr << "Failed to send error response: " << strerror(errno) << std::endl;
                }
            }
            CLOSE_SOCKET(client_fd);
            active_connections_.fetch_sub(1, std::memory_order_relaxed);
            return;
        }

        // Process request and generate response
        response = http::processRequest(request, address());

        // Send response
        std::string response_str = response.serialize();
        ssize_t bytes_sent = send(client_fd, response_str.c_str(), response_str.length(), 0);
        if (bytes_sent < 0) {
            std::cerr << "Failed to send response: " << strerror(errno) << std::endl;
        }

        // Close connection
        CLOSE_SOCKET(client_fd);
        active_connections_.fetch_sub(1, std::memory_order_relaxed);
    }
    
    std::string bind_address_;
    int port_;
    std::atomic<bool> running_;
    socket_t server_fd_;
    std::thread accept_thread_;
    std::atomic<size_t> active_connections_;
};

} // namespace daemon
} // namespace dbal

#endif
