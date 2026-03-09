/**
 * @file parse_request_line.hpp
 * @brief Parse HTTP request line
 */

#pragma once

#include <string>
#include <sstream>
#include <unordered_set>
#include "../request/http_request.hpp"
#include "../response/http_response.hpp"

namespace dbal {
namespace daemon {

namespace {

/**
 * @brief Check if HTTP method is in the allowed whitelist (MED-002 fix)
 * @param method HTTP method string
 * @return true if method is allowed
 */
inline bool isValidHttpMethod(const std::string& method) {
    static const std::unordered_set<std::string> valid_methods = {
        "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"
    };
    return valid_methods.count(method) > 0;
}

} // anonymous namespace

/**
 * @brief Parse HTTP request line (method, path, version)
 * @param line Request line string
 * @param request Request to populate
 * @param error_response Error response if parsing fails
 * @return true on success
 *
 * Security features (MED-002 fix):
 * - Validates HTTP method against whitelist
 * - Rejects unknown or malformed methods
 */
inline bool parse_request_line(
    const std::string& line,
    HttpRequest& request,
    HttpResponse& error_response
) {
    std::istringstream line_stream(line);
    line_stream >> request.method >> request.path >> request.version;

    if (request.method.empty() || request.path.empty() || request.version.empty()) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Invalid request line"})";
        return false;
    }

    // MED-002 FIX: Validate HTTP method against whitelist
    if (!isValidHttpMethod(request.method)) {
        error_response.status_code = 405;
        error_response.status_text = "Method Not Allowed";
        error_response.body = R"({"error":"HTTP method not allowed"})";
        return false;
    }

    return true;
}

} // namespace daemon
} // namespace dbal
