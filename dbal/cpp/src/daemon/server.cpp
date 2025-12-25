#include <string>
#include <thread>
#include <vector>
#include <memory>
#include <iostream>
#include <cstring>
#include <sstream>
#include <map>

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

struct HttpRequest {
    std::string method;
    std::string path;
    std::string version;
    std::map<std::string, std::string> headers;
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
        : bind_address_(bind_address), port_(port), running_(false), server_fd_(INVALID_SOCKET_VALUE) {
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
            
            // Handle connection in a new thread
            std::thread(&Server::handleConnection, this, client_fd).detach();
        }
    }
    
    void handleConnection(socket_t client_fd) {
        // Set receive timeout
#ifdef _WIN32
        DWORD timeout = 30000; // 30 seconds in milliseconds
        setsockopt(client_fd, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));
#else
        struct timeval timeout;
        timeout.tv_sec = 30;
        timeout.tv_usec = 0;
        setsockopt(client_fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
#endif
        
        HttpRequest request;
        if (!parseRequest(client_fd, request)) {
            CLOSE_SOCKET(client_fd);
            return;
        }
        
        // Process request and generate response
        HttpResponse response = processRequest(request);
        
        // Send response
        std::string response_str = response.serialize();
        send(client_fd, response_str.c_str(), response_str.length(), 0);
        
        // Close connection (HTTP/1.1 could support keep-alive, but simple close for now)
        CLOSE_SOCKET(client_fd);
    }
    
    bool parseRequest(socket_t client_fd, HttpRequest& request) {
        char buffer[8192];
#ifdef _WIN32
        int bytes_read = recv(client_fd, buffer, sizeof(buffer) - 1, 0);
#else
        ssize_t bytes_read = recv(client_fd, buffer, sizeof(buffer) - 1, 0);
#endif
        
        if (bytes_read <= 0) {
            return false;
        }
        
        buffer[bytes_read] = '\0';
        std::string request_str(buffer, bytes_read);
        
        // Parse request line
        size_t line_end = request_str.find("\r\n");
        if (line_end == std::string::npos) return false;
        
        std::string request_line = request_str.substr(0, line_end);
        std::istringstream line_stream(request_line);
        line_stream >> request.method >> request.path >> request.version;
        
        // Parse headers
        size_t pos = line_end + 2;
        while (pos < request_str.length()) {
            line_end = request_str.find("\r\n", pos);
            if (line_end == std::string::npos) break;
            
            std::string header_line = request_str.substr(pos, line_end - pos);
            if (header_line.empty()) {
                // End of headers
                pos = line_end + 2;
                break;
            }
            
            size_t colon = header_line.find(':');
            if (colon != std::string::npos) {
                std::string key = header_line.substr(0, colon);
                std::string value = header_line.substr(colon + 1);
                
                // Trim whitespace
                while (!value.empty() && value[0] == ' ') value = value.substr(1);
                while (!value.empty() && value[value.length()-1] == ' ') value.pop_back();
                
                request.headers[key] = value;
            }
            
            pos = line_end + 2;
        }
        
        // Parse body if present
        if (pos < request_str.length()) {
            request.body = request_str.substr(pos);
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
};

}
}
