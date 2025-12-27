/**
 * @file request_real_ip.hpp
 * @brief Extract real IP from nginx reverse proxy headers
 */

#pragma once

#include <string>
#include "http_request.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Get real client IP from X-Real-IP or X-Forwarded-For headers
 * @param request The HTTP request
 * @return Real IP or empty string
 */
inline std::string request_real_ip(const HttpRequest& request) {
    auto it = request.headers.find("X-Real-IP");
    if (it != request.headers.end()) {
        return it->second;
    }
    
    it = request.headers.find("X-Forwarded-For");
    if (it != request.headers.end()) {
        // Get first IP from comma-separated list
        size_t comma = it->second.find(',');
        return comma != std::string::npos 
            ? it->second.substr(0, comma) 
            : it->second;
    }
    
    return "";
}

} // namespace daemon
} // namespace dbal
