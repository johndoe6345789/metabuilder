/**
 * @file request_parser.hpp
 * @brief HTTP request parser with security validations
 * 
 * Parses raw HTTP requests with protection against CVE-style attacks.
 */
#ifndef DBAL_REQUEST_PARSER_HPP
#define DBAL_REQUEST_PARSER_HPP

#include "../http_types.hpp"
#include "../server/security_limits.hpp"
#include <string>
#include <sstream>
#include <algorithm>
#include <cctype>
#include <limits>

// Cross-platform socket headers
#ifdef _WIN32
    #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
    #endif
    #include <windows.h>
    #include <winsock2.h>
    typedef SOCKET socket_t;
#else
    #include <sys/socket.h>
    typedef int socket_t;
#endif

namespace dbal {
namespace daemon {
namespace http {

/**
 * Parse HTTP request from socket with security validations
 * 
 * @param client_fd Socket file descriptor
 * @param request Output request structure
 * @param error_response Output error response if parsing fails
 * @return true if parsing succeeded, false otherwise
 */
inline bool parseRequest(socket_t client_fd, HttpRequest& request, HttpResponse& error_response) {
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
        error_response = HttpResponse::error(413, "Request Entity Too Large", "Request too large");
        return false;
    }
    
    // Parse request line
    size_t line_end = request_data.find("\r\n");
    if (line_end == std::string::npos) {
        error_response = HttpResponse::error(400, "Bad Request", "Invalid request format");
        return false;
    }
    
    std::string request_line = request_data.substr(0, line_end);
    std::istringstream line_stream(request_line);
    line_stream >> request.method >> request.path >> request.version;
    
    // Validate method, path, and version
    if (request.method.empty() || request.path.empty() || request.version.empty()) {
        error_response = HttpResponse::error(400, "Bad Request", "Invalid request line");
        return false;
    }
    
    // Check for null bytes in path (CVE pattern)
    if (request.path.find('\0') != std::string::npos) {
        error_response = HttpResponse::error(400, "Bad Request", "Null byte in path");
        return false;
    }
    
    // Validate path length
    if (request.path.length() > MAX_PATH_LENGTH) {
        error_response = HttpResponse::error(414, "URI Too Long", "Path too long");
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
            error_response = HttpResponse::error(431, "Request Header Fields Too Large", "Too many headers");
            return false;
        }
        
        // Check header size
        if (header_line.length() > MAX_HEADER_SIZE) {
            error_response = HttpResponse::error(431, "Request Header Fields Too Large", "Header too large");
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
                error_response = HttpResponse::error(400, "Bad Request", "CRLF in header value");
                return false;
            }
            
            // Check for null bytes in headers
            if (value.find('\0') != std::string::npos) {
                error_response = HttpResponse::error(400, "Bad Request", "Null byte in header");
                return false;
            }
            
            // Detect duplicate Content-Length headers (CVE-2024-1135 pattern)
            std::string key_lower = key;
            std::transform(key_lower.begin(), key_lower.end(), key_lower.begin(), ::tolower);
            
            if (key_lower == "content-length") {
                if (has_content_length) {
                    // Multiple Content-Length headers - request smuggling attempt
                    error_response = HttpResponse::error(400, "Bad Request", "Multiple Content-Length headers");
                    return false;
                }
                has_content_length = true;
                
                // Validate Content-Length is a valid number
                try {
                    // Check for integer overflow
                    unsigned long long cl = std::stoull(value);
                    if (cl > MAX_BODY_SIZE) {
                        error_response = HttpResponse::error(413, "Request Entity Too Large", "Content-Length too large");
                        return false;
                    }
                    // Validate fits in size_t (platform dependent)
                    if (cl > std::numeric_limits<size_t>::max()) {
                        error_response = HttpResponse::error(413, "Request Entity Too Large", "Content-Length exceeds platform limit");
                        return false;
                    }
                    content_length = static_cast<size_t>(cl);
                } catch (const std::invalid_argument&) {
                    error_response = HttpResponse::error(400, "Bad Request", "Invalid Content-Length");
                    return false;
                } catch (const std::out_of_range&) {
                    error_response = HttpResponse::error(400, "Bad Request", "Content-Length out of range");
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
    if (has_transfer_encoding && has_content_length) {
        error_response = HttpResponse::error(400, "Bad Request", "Both Transfer-Encoding and Content-Length present");
        return false;
    }
    
    // We don't support Transfer-Encoding (chunked), return 501 Not Implemented
    if (has_transfer_encoding) {
        error_response = HttpResponse::error(501, "Not Implemented", "Transfer-Encoding not supported");
        return false;
    }
    
    // Parse body if present
    if (pos < request_data.length()) {
        request.body = request_data.substr(pos);
    }
    
    // Suppress unused variable warning
    (void)content_length;
    
    return true;
}

} // namespace http
} // namespace daemon
} // namespace dbal

#endif
