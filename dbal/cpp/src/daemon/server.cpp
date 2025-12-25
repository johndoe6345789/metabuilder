/**
 * @file server.cpp
 * @brief Cross-platform HTTP/1.1 server implementation with nginx reverse proxy support
 *
 * Provides a production-ready HTTP server with:
 * - Cross-platform socket support (Windows/Linux/macOS)
 * - Multi-threaded request handling
 * - Nginx reverse proxy header parsing
 * - Health check endpoints
 * - Graceful shutdown
 * - Security hardening against CVE patterns (CVE-2024-1135, CVE-2024-40725, etc.)
 */

#include <string>
#include <thread>
#include <vector>
#include <memory>
#include <iostream>
#include <cstring>
#include <sstream>
#include <map>
#include <mutex>
#include <atomic>
#include <algorithm>
#include <cctype>
#include <limits>

// Cross-platform socket headers
#ifdef _WIN32
    // Windows
    #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
    #endif
    #include <windows.h>
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
    
    // Windows socket type aliases
    typedef SOCKET socket_t;
    typedef int socklen_t;
    #define CLOSE_SOCKET closesocket
    #define INVALID_SOCKET_VALUE INVALID_SOCKET
    #define SOCKET_ERROR_VALUE SOCKET_ERROR
#else
    // POSIX (Linux, macOS, Unix)
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #include <fcntl.h>
    #include <errno.h>
    
    // POSIX socket type aliases
    typedef int socket_t;
    #define CLOSE_SOCKET close
    #define INVALID_SOCKET_VALUE -1
    #define SOCKET_ERROR_VALUE -1
#endif

namespace dbal {
namespace daemon {

// Security limits to prevent CVE-style attacks
const size_t MAX_REQUEST_SIZE = 65536;      // 64KB max request (prevent buffer overflow)
const size_t MAX_HEADERS = 100;              // Max 100 headers (prevent header bomb)
const size_t MAX_HEADER_SIZE = 8192;         // 8KB max per header
const size_t MAX_PATH_LENGTH = 2048;         // Max URL path length
const size_t MAX_BODY_SIZE = 10485760;       // 10MB max body size
const size_t MAX_CONCURRENT_CONNECTIONS = 1000; // Prevent thread exhaustion

/**
 * @struct HttpRequest
 * @brief Parsed HTTP request structure
 *
 * Contains all components of an HTTP request including method,
 * path, version, and headers. Used internally for request processing.
 */
struct HttpRequest {
    std::string method;   ///< HTTP method (GET, POST, etc.)
    std::string path;     ///< Request path (e.g., /api/health)
    std::string version;  ///< HTTP version (e.g., HTTP/1.1)
    std::map<std::string, std::string> headers;  ///< Request headers
    std::string body;
    
    // Nginx reverse proxy headers
    std::string realIP() const {
        auto it = headers.find("X-Real-IP");
        if (it != headers.end()) return it->second;
        it = headers.find("X-Forwarded-For");
        if (it != headers.end()) {
            // Get first IP from comma-separated list
            size_t comma = it->second.find(',');
            return comma != std::string::npos ? it->second.substr(0, comma) : it->second;
        }
        return "";
    }
    
    std::string forwardedProto() const {
        auto it = headers.find("X-Forwarded-Proto");
        return it != headers.end() ? it->second : "http";
    }
};

struct HttpResponse {
    int status_code;
    std::string status_text;
    std::map<std::string, std::string> headers;
    std::string body;
    
    HttpResponse() : status_code(200), status_text("OK") {
        headers["Content-Type"] = "application/json";
        headers["Server"] = "DBAL/1.0.0";
    }
    
    std::string serialize() const {
        std::ostringstream oss;
        oss << "HTTP/1.1 " << status_code << " " << status_text << "\r\n";
        
        // Add Content-Length if not already set
        auto cl_it = headers.find("Content-Length");
        if (cl_it == headers.end()) {
            oss << "Content-Length: " << body.length() << "\r\n";
        }
        
        for (const auto& h : headers) {
            oss << h.first << ": " << h.second << "\r\n";
        }
        
        oss << "\r\n" << body;
        return oss.str();
    }
};

class Server {
public:
    Server(const std::string& bind_address, int port)
        : bind_address_(bind_address), port_(port), running_(false), 
          server_fd_(INVALID_SOCKET_VALUE), active_connections_(0) {
#ifdef _WIN32
        // Initialize Winsock on Windows
        WSADATA wsaData;
        int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
        if (result != 0) {
            std::cerr << "WSAStartup failed: " << result << std::endl;
        }
#endif
    }
    
    ~Server() {
        stop();
#ifdef _WIN32
        // Cleanup Winsock on Windows
        WSACleanup();
#endif
    }
    
    bool start() {
        if (running_) return false;
        
        // Create socket
        server_fd_ = socket(AF_INET, SOCK_STREAM, 0);
        if (server_fd_ == INVALID_SOCKET_VALUE) {
            std::cerr << "Failed to create socket: " << getLastErrorString() << std::endl;
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
            std::cerr << "Failed to set SO_REUSEADDR: " << getLastErrorString() << std::endl;
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
            return false;
        }
        
        // Bind to address
        struct sockaddr_in address;
        std::memset(&address, 0, sizeof(address));
        address.sin_family = AF_INET;
        address.sin_port = htons(port_);
        
        if (bind_address_ == "0.0.0.0" || bind_address_ == "::") {
            address.sin_addr.s_addr = INADDR_ANY;
        } else {
#ifdef _WIN32
            // Windows inet_pton
            if (InetPton(AF_INET, bind_address_.c_str(), &address.sin_addr) <= 0) {
                std::cerr << "Invalid bind address: " << bind_address_ << std::endl;
                CLOSE_SOCKET(server_fd_);
                server_fd_ = INVALID_SOCKET_VALUE;
                return false;
            }
#else
            // POSIX inet_pton
            if (inet_pton(AF_INET, bind_address_.c_str(), &address.sin_addr) <= 0) {
                std::cerr << "Invalid bind address: " << bind_address_ << std::endl;
                CLOSE_SOCKET(server_fd_);
                server_fd_ = INVALID_SOCKET_VALUE;
                return false;
            }
#endif
        }
        
        if (bind(server_fd_, (struct sockaddr*)&address, sizeof(address)) < 0) {
            std::cerr << "Failed to bind to " << bind_address_ << ":" << port_ 
                     << ": " << getLastErrorString() << std::endl;
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
            return false;
        }
        
        // Listen for connections (backlog of 128)
        if (listen(server_fd_, 128) < 0) {
            std::cerr << "Failed to listen: " << getLastErrorString() << std::endl;
            CLOSE_SOCKET(server_fd_);
            server_fd_ = INVALID_SOCKET_VALUE;
            return false;
        }
        
        running_ = true;
        
        // Start accept thread
        accept_thread_ = std::thread(&Server::acceptLoop, this);
        
        std::cout << "Server listening on " << bind_address_ << ":" << port_ << std::endl;
        return true;
    }
    
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
    
    bool isRunning() const {
        return running_;
    }
    
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
                    std::cerr << "Accept failed: " << getLastErrorString() << std::endl;
                }
                continue;
            }
            
            // Check connection limit to prevent thread exhaustion DoS
            if (active_connections_.load() >= MAX_CONCURRENT_CONNECTIONS) {
                std::cerr << "Connection limit reached, rejecting connection" << std::endl;
                CLOSE_SOCKET(client_fd);
                continue;
            }
            
            active_connections_++;
            
            // Handle connection in a new thread
            std::thread(&Server::handleConnection, this, client_fd).detach();
        }
    }
    
    void handleConnection(socket_t client_fd) {
        // Set receive timeout
#ifdef _WIN32
        DWORD timeout = 30000; // 30 seconds in milliseconds
        setsockopt(client_fd, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));
        setsockopt(client_fd, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeout, sizeof(timeout));
#else
        struct timeval timeout;
        timeout.tv_sec = 30;
        timeout.tv_usec = 0;
        setsockopt(client_fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
        setsockopt(client_fd, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
#endif
        
        HttpRequest request;
        HttpResponse response;
        
        if (!parseRequest(client_fd, request, response)) {
            // Send error response if one was set
            if (response.status_code != 200) {
                std::string response_str = response.serialize();
                send(client_fd, response_str.c_str(), response_str.length(), 0);
            }
            CLOSE_SOCKET(client_fd);
            active_connections_--;
            return;
        }
        
        // Process request and generate response
        response = processRequest(request);
        
        // Send response
        std::string response_str = response.serialize();
        send(client_fd, response_str.c_str(), response_str.length(), 0);
        
        // Close connection (HTTP/1.1 could support keep-alive, but simple close for now)
        CLOSE_SOCKET(client_fd);
        active_connections_--;
    }
    
    bool parseRequest(socket_t client_fd, HttpRequest& request, HttpResponse& error_response) {
        // Use larger buffer but still enforce limits
        std::string request_data;
        request_data.reserve(8192);
        
        char buffer[8192];
        size_t total_read = 0;
        bool headers_complete = false;
        
        // Read request with size limit
        while (total_read < MAX_REQUEST_SIZE && !headers_complete) {
#ifdef _WIN32
            int bytes_read = recv(client_fd, buffer, sizeof(buffer), 0);
#else
            ssize_t bytes_read = recv(client_fd, buffer, sizeof(buffer), 0);
#endif
            
            if (bytes_read <= 0) {
                return false;
            }
            
            request_data.append(buffer, bytes_read);
            total_read += bytes_read;
            
            // Check if headers are complete
            if (request_data.find("\r\n\r\n") != std::string::npos) {
                headers_complete = true;
            }
        }
        
        // Check if request is too large
        if (total_read >= MAX_REQUEST_SIZE && !headers_complete) {
            error_response.status_code = 413;
            error_response.status_text = "Request Entity Too Large";
            error_response.body = R"({"error":"Request too large"})";
            return false;
        }
        
        // Parse request line
        size_t line_end = request_data.find("\r\n");
        if (line_end == std::string::npos) {
            error_response.status_code = 400;
            error_response.status_text = "Bad Request";
            error_response.body = R"({"error":"Invalid request format"})";
            return false;
        }
        
        std::string request_line = request_data.substr(0, line_end);
        std::istringstream line_stream(request_line);
        line_stream >> request.method >> request.path >> request.version;
        
        // Validate method, path, and version
        if (request.method.empty() || request.path.empty() || request.version.empty()) {
            error_response.status_code = 400;
            error_response.status_text = "Bad Request";
            error_response.body = R"({"error":"Invalid request line"})";
            return false;
        }
        
        // Check for null bytes in path (CVE pattern)
        if (request.path.find('\0') != std::string::npos) {
            error_response.status_code = 400;
            error_response.status_text = "Bad Request";
            error_response.body = R"({"error":"Null byte in path"})";
            return false;
        }
        
        // Validate path length
        if (request.path.length() > MAX_PATH_LENGTH) {
            error_response.status_code = 414;
            error_response.status_text = "URI Too Long";
            error_response.body = R"({"error":"Path too long"})";
            return false;
        }
        
        // Parse headers
        size_t pos = line_end + 2;
        size_t header_count = 0;
        bool has_content_length = false;
        bool has_transfer_encoding = false;
        size_t content_length = 0;
        
        while (pos < request_data.length()) {
            line_end = request_data.find("\r\n", pos);
            if (line_end == std::string::npos) break;
            
            std::string header_line = request_data.substr(pos, line_end - pos);
            if (header_line.empty()) {
                // End of headers
                pos = line_end + 2;
                break;
            }
            
            // Check header bomb protection
            if (++header_count > MAX_HEADERS) {
                error_response.status_code = 431;
                error_response.status_text = "Request Header Fields Too Large";
                error_response.body = R"({"error":"Too many headers"})";
                return false;
            }
            
            // Check header size
            if (header_line.length() > MAX_HEADER_SIZE) {
                error_response.status_code = 431;
                error_response.status_text = "Request Header Fields Too Large";
                error_response.body = R"({"error":"Header too large"})";
                return false;
            }
            
            size_t colon = header_line.find(':');
            if (colon != std::string::npos) {
                std::string key = header_line.substr(0, colon);
                std::string value = header_line.substr(colon + 1);
                
                // Trim whitespace
                while (!value.empty() && value[0] == ' ') value = value.substr(1);
                while (!value.empty() && value[value.length()-1] == ' ') value.pop_back();
                
                // Check for CRLF injection in header values
                if (value.find("\r\n") != std::string::npos) {
                    error_response.status_code = 400;
                    error_response.status_text = "Bad Request";
                    error_response.body = R"({"error":"CRLF in header value"})";
                    return false;
                }
                
                // Check for null bytes in headers
                if (value.find('\0') != std::string::npos) {
                    error_response.status_code = 400;
                    error_response.status_text = "Bad Request";
                    error_response.body = R"({"error":"Null byte in header"})";
                    return false;
                }
                
                // Detect duplicate Content-Length headers (CVE-2024-1135 pattern)
                std::string key_lower = key;
                std::transform(key_lower.begin(), key_lower.end(), key_lower.begin(), ::tolower);
                
                if (key_lower == "content-length") {
                    if (has_content_length) {
                        // Multiple Content-Length headers - request smuggling attempt
                        error_response.status_code = 400;
                        error_response.status_text = "Bad Request";
                        error_response.body = R"({"error":"Multiple Content-Length headers"})";
                        return false;
                    }
                    has_content_length = true;
                    
                    // Validate Content-Length is a valid number
                    try {
                        // Check for integer overflow
                        unsigned long long cl = std::stoull(value);
                        if (cl > MAX_BODY_SIZE) {
                            error_response.status_code = 413;
                            error_response.status_text = "Request Entity Too Large";
                            error_response.body = R"({"error":"Content-Length too large"})";
                            return false;
                        }
                        content_length = static_cast<size_t>(cl);
                    } catch (...) {
                        error_response.status_code = 400;
                        error_response.status_text = "Bad Request";
                        error_response.body = R"({"error":"Invalid Content-Length"})";
                        return false;
                    }
                }
                
                // Detect Transfer-Encoding header (CVE-2024-23452 pattern)
                if (key_lower == "transfer-encoding") {
                    has_transfer_encoding = true;
                }
                
                request.headers[key] = value;
            }
            
            pos = line_end + 2;
        }
        
        // Check for request smuggling: Transfer-Encoding + Content-Length
        // Per RFC 7230: "If a message is received with both a Transfer-Encoding 
        // and a Content-Length header field, the Transfer-Encoding overrides the Content-Length"
        if (has_transfer_encoding && has_content_length) {
            error_response.status_code = 400;
            error_response.status_text = "Bad Request";
            error_response.body = R"({"error":"Both Transfer-Encoding and Content-Length present"})";
            return false;
        }
        
        // We don't support Transfer-Encoding (chunked), return 501 Not Implemented
        if (has_transfer_encoding) {
            error_response.status_code = 501;
            error_response.status_text = "Not Implemented";
            error_response.body = R"({"error":"Transfer-Encoding not supported"})";
            return false;
        }
        
        // Parse body if present
        if (pos < request_data.length()) {
            request.body = request_data.substr(pos);
        }
        
        return true;
    }
    
    HttpResponse processRequest(const HttpRequest& request) {
        HttpResponse response;
        
        // Health check endpoint (for nginx health checks)
        if (request.path == "/health" || request.path == "/healthz") {
            response.status_code = 200;
            response.status_text = "OK";
            response.body = R"({"status":"healthy","service":"dbal"})";
            return response;
        }
        
        // API endpoints
        if (request.path == "/api/version" || request.path == "/version") {
            response.body = R"({"version":"1.0.0","service":"DBAL Daemon"})";
            return response;
        }
        
        if (request.path == "/api/status" || request.path == "/status") {
            std::ostringstream body;
            body << R"({"status":"running","address":")" << address() << R"(")"
                 << R"(,"real_ip":")" << request.realIP() << R"(")"
                 << R"(,"forwarded_proto":")" << request.forwardedProto() << R"(")"
                 << "}";
            response.body = body.str();
            return response;
        }
        
        // Default 404
        response.status_code = 404;
        response.status_text = "Not Found";
        response.body = R"({"error":"Not Found","path":")" + request.path + "\"}";
        return response;
    }
    
    std::string getLastErrorString() {
#ifdef _WIN32
        int error = WSAGetLastError();
        char* message = nullptr;
        FormatMessageA(
            FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
            nullptr, error, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
            (LPSTR)&message, 0, nullptr);
        std::string result = message ? message : "Unknown error";
        if (message) LocalFree(message);
        return result;
#else
        return strerror(errno);
#endif
    }
    
    std::string bind_address_;
    int port_;
    bool running_;
    socket_t server_fd_;
    std::thread accept_thread_;
    std::atomic<size_t> active_connections_;
};

}
}
