/**
 * @file server_parse_request.hpp
 * @brief Server request parsing implementation
 */

#pragma once

#include <sstream>
#include "server.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Parse incoming HTTP request
 */
inline bool Server::parseRequest(
    socket_t client_fd,
    HttpRequest& request,
    HttpResponse& error_response
) {
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
        
        if (bytes_read <= 0) return false;
        
        request_data.append(buffer, bytes_read);
        total_read += bytes_read;
        
        if (request_data.find("\r\n\r\n") != std::string::npos) {
            headers_complete = true;
        }
    }
    
    // Check size limit
    if (total_read >= MAX_REQUEST_SIZE && !headers_complete) {
        error_response.status_code = 413;
        error_response.status_text = "Request Entity Too Large";
        error_response.body = R"({"error":"Request too large"})";
        return false;
    }
    
    // Find request line
    size_t line_end = request_data.find("\r\n");
    if (line_end == std::string::npos) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Invalid request format"})";
        return false;
    }
    
    // Parse request line
    std::string request_line = request_data.substr(0, line_end);
    if (!parse_request_line(request_line, request, error_response)) {
        return false;
    }
    
    // Validate path
    if (!validate_request_path(request.path, error_response)) {
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
            pos = line_end + 2;
            break;
        }
        
        // Validate header count
        if (!validate_header_count(++header_count, error_response)) {
            return false;
        }
        
        // Validate header size
        if (!validate_header_size(header_line.length(), error_response)) {
            return false;
        }
        
        size_t colon = header_line.find(':');
        if (colon != std::string::npos) {
            std::string key = header_line.substr(0, colon);
            std::string value = header_line.substr(colon + 1);
            
            trim_string(value);
            
            // Validate header value
            if (!validate_header_value(value, error_response)) {
                return false;
            }
            
            std::string key_lower = to_lowercase(key);
            
            // Check Content-Length
            if (key_lower == "content-length") {
                if (!check_duplicate_content_length(has_content_length, error_response)) {
                    return false;
                }
                has_content_length = true;
                
                if (!validate_content_length(value, content_length, error_response)) {
                    return false;
                }
            }
            
            // Check Transfer-Encoding
            if (key_lower == "transfer-encoding") {
                has_transfer_encoding = true;
            }
            
            request.headers[key] = value;
        }
        
        pos = line_end + 2;
    }
    
    // Check for request smuggling
    if (!check_request_smuggling(has_transfer_encoding, has_content_length, error_response)) {
        return false;
    }
    
    // Reject Transfer-Encoding
    if (!check_transfer_encoding_unsupported(has_transfer_encoding, error_response)) {
        return false;
    }
    
    // Parse body
    if (pos < request_data.length()) {
        request.body = request_data.substr(pos);
    }
    
    return true;
}

} // namespace daemon
} // namespace dbal
