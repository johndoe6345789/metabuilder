/**
 * @file parse_request_line.hpp
 * @brief Parse HTTP request line
 */

#pragma once

#include <string>
#include <sstream>
#include "http_request.hpp"
#include "http_response.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Parse HTTP request line (method, path, version)
 * @param line Request line string
 * @param request Request to populate
 * @param error_response Error response if parsing fails
 * @return true on success
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
    
    return true;
}

} // namespace daemon
} // namespace dbal
