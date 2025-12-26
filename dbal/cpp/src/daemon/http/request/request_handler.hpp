/**
 * @file request_handler.hpp
 * @brief HTTP request routing and handling
 * 
 * Routes incoming requests to appropriate handlers.
 */
#ifndef DBAL_REQUEST_HANDLER_HPP
#define DBAL_REQUEST_HANDLER_HPP

#include "http_types.hpp"
#include <string>
#include <sstream>

namespace dbal {
namespace daemon {
namespace http {

/**
 * Process HTTP request and generate response
 * 
 * @param request Parsed HTTP request
 * @param server_address Server address for status endpoint
 * @return HTTP response
 */
inline HttpResponse processRequest(const HttpRequest& request, const std::string& server_address) {
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
        body << R"({"status":"running","address":")" << server_address << R"(")"
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

} // namespace http
} // namespace daemon
} // namespace dbal

#endif
