/**
 * @file validate_content_length.hpp
 * @brief Validate Content-Length header
 */

#pragma once

#include <string>
#include <limits>
#include "http_response.hpp"
#include "socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Validate and parse Content-Length header
 * @param value Header value
 * @param content_length Output content length
 * @param error_response Error response if validation fails
 * @return true if valid
 */
inline bool validate_content_length(
    const std::string& value,
    size_t& content_length,
    HttpResponse& error_response
) {
    try {
        // Check for integer overflow
        unsigned long long cl = std::stoull(value);
        
        if (cl > MAX_BODY_SIZE) {
            error_response.status_code = 413;
            error_response.status_text = "Request Entity Too Large";
            error_response.body = R"({"error":"Content-Length too large"})";
            return false;
        }
        
        // Validate fits in size_t (platform dependent)
        if (cl > std::numeric_limits<size_t>::max()) {
            error_response.status_code = 413;
            error_response.status_text = "Request Entity Too Large";
            error_response.body = R"({"error":"Content-Length exceeds platform limit"})";
            return false;
        }
        
        content_length = static_cast<size_t>(cl);
        return true;
    } catch (...) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Invalid Content-Length"})";
        return false;
    }
}

/**
 * @brief Check for duplicate Content-Length (CVE-2024-1135)
 * @param has_content_length Whether Content-Length was already seen
 * @param error_response Error response if duplicate
 * @return true if not duplicate
 */
inline bool check_duplicate_content_length(
    bool has_content_length,
    HttpResponse& error_response
) {
    if (has_content_length) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Multiple Content-Length headers"})";
        return false;
    }
    return true;
}

} // namespace daemon
} // namespace dbal
