/**
 * @file validate_path.hpp
 * @brief Validate HTTP request path for security issues
 */

#pragma once

#include <string>
#include "http_response.hpp"
#include "socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Validate request path for null bytes and length
 * @param path Request path
 * @param error_response Error response if validation fails
 * @return true if path is valid
 */
inline bool validate_request_path(
    const std::string& path,
    HttpResponse& error_response
) {
    // Check for null bytes in path (CVE pattern)
    if (path.find('\0') != std::string::npos) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Null byte in path"})";
        return false;
    }
    
    // Validate path length
    if (path.length() > MAX_PATH_LENGTH) {
        error_response.status_code = 414;
        error_response.status_text = "URI Too Long";
        error_response.body = R"({"error":"Path too long"})";
        return false;
    }
    
    return true;
}

} // namespace daemon
} // namespace dbal
