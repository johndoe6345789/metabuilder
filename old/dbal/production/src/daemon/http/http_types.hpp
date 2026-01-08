/**
 * @file http_types.hpp
 * @brief HTTP request/response types and structures
 * 
 * Defines the core data structures for HTTP handling.
 */
#ifndef DBAL_HTTP_TYPES_HPP
#define DBAL_HTTP_TYPES_HPP

#include <string>
#include <map>
#include <sstream>
#include <algorithm>

namespace dbal {
namespace daemon {
namespace http {

/**
 * @struct HttpRequest
 * @brief Parsed HTTP request structure
 */
struct HttpRequest {
    std::string method;   ///< HTTP method (GET, POST, etc.)
    std::string path;     ///< Request path (e.g., /api/health)
    std::string version;  ///< HTTP version (e.g., HTTP/1.1)
    std::map<std::string, std::string> headers;  ///< Request headers
    std::string body;
    
    /**
     * Get real client IP from reverse proxy headers
     */
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
    
    /**
     * Get forwarded protocol from reverse proxy headers
     */
    std::string forwardedProto() const {
        auto it = headers.find("X-Forwarded-Proto");
        return it != headers.end() ? it->second : "http";
    }
};

/**
 * @struct HttpResponse
 * @brief HTTP response structure
 */
struct HttpResponse {
    int status_code;
    std::string status_text;
    std::map<std::string, std::string> headers;
    std::string body;
    
    HttpResponse() : status_code(200), status_text("OK") {
        headers["Content-Type"] = "application/json";
        headers["Server"] = "DBAL/1.0.0";
    }
    
    /**
     * Serialize response to HTTP wire format
     */
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
    
    /**
     * Create error response
     */
    static HttpResponse error(int code, const std::string& text, const std::string& message) {
        HttpResponse response;
        response.status_code = code;
        response.status_text = text;
        response.body = R"({"error":")" + message + "\"}";
        return response;
    }
    
    /**
     * Create JSON response
     */
    static HttpResponse json(const std::string& body, int code = 200) {
        HttpResponse response;
        response.status_code = code;
        response.status_text = code == 200 ? "OK" : "Error";
        response.body = body;
        return response;
    }
};

} // namespace http
} // namespace daemon
} // namespace dbal

#endif
