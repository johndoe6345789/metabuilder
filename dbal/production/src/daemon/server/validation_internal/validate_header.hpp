/**
 * @file validate_header.hpp
 * @brief Validate HTTP header for security issues
 */

#pragma once

#include <string>
#include "../response/http_response.hpp"
#include "../socket/socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Validate header value for CRLF injection and null bytes
 * @param value Header value
 * @param error_response Error response if validation fails
 * @return true if header is valid
 */
inline bool validate_header_value(
    const std::string& value,
    HttpResponse& error_response
) {
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
    
    return true;
}

/**
 * @brief Validate header count (prevent header bomb)
 * @param count Current header count
 * @param error_response Error response if validation fails
 * @return true if count is acceptable
 */
inline bool validate_header_count(
    size_t count,
    HttpResponse& error_response
) {
    if (count > MAX_HEADERS) {
        error_response.status_code = 431;
        error_response.status_text = "Request Header Fields Too Large";
        error_response.body = R"({"error":"Too many headers"})";
        return false;
    }
    return true;
}

/**
 * @brief Validate header size
 * @param size Header size
 * @param error_response Error response if validation fails
 * @return true if size is acceptable
 */
inline bool validate_header_size(
    size_t size,
    HttpResponse& error_response
) {
    if (size > MAX_HEADER_SIZE) {
        error_response.status_code = 431;
        error_response.status_text = "Request Header Fields Too Large";
        error_response.body = R"({"error":"Header too large"})";
        return false;
    }
    return true;
}

} // namespace daemon
} // namespace dbal
