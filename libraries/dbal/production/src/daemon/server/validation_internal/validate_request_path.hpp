/**
 * @file validate_path.hpp
 * @brief Validate HTTP request path for security issues
 */

#pragma once

#include <algorithm>
#include <cctype>
#include <string>
#include "../response/http_response.hpp"
#include "../socket/socket_types.hpp"

namespace dbal {
namespace daemon {

namespace {

/**
 * @brief Convert string to lowercase for case-insensitive comparison
 */
inline std::string toLowerPath(const std::string& s) {
    std::string result = s;
    std::transform(result.begin(), result.end(), result.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return result;
}

} // anonymous namespace

/**
 * @brief Validate request path for security issues (HIGH-001 fix)
 * @param path Request path
 * @param error_response Error response if validation fails
 * @return true if path is valid
 *
 * Security checks:
 * - Null byte injection prevention
 * - Path length validation
 * - Path traversal prevention (../, encoded variants)
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

    // HIGH-001 FIX: Check for path traversal sequences
    if (path.find("..") != std::string::npos) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Path traversal detected"})";
        return false;
    }

    // HIGH-001 FIX: Check for URL-encoded path traversal attempts
    // Convert to lowercase for case-insensitive matching
    const std::string lowerPath = toLowerPath(path);

    // Check for %2e%2e (encoded ..)
    if (lowerPath.find("%2e%2e") != std::string::npos) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Encoded path traversal detected"})";
        return false;
    }

    // Check for %2e.%2e, ..%2f, ..%5c, and other mixed encoding variants
    if (lowerPath.find("..%2f") != std::string::npos ||  // ../ encoded
        lowerPath.find("..%5c") != std::string::npos ||  // ..\ encoded
        lowerPath.find("%2e.") != std::string::npos ||   // .x. patterns
        lowerPath.find(".%2e") != std::string::npos) {   // x.. patterns
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Encoded path traversal detected"})";
        return false;
    }

    // Check for double-encoded traversal (%252e = %2e when decoded twice)
    if (lowerPath.find("%252e") != std::string::npos) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Double-encoded path traversal detected"})";
        return false;
    }

    return true;
}

} // namespace daemon
} // namespace dbal
