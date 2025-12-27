/**
 * @file process_version.hpp
 * @brief Handle version endpoint
 */

#pragma once

#include <string>
#include "http_request.hpp"
#include "http_response.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Check if request is a version request and process it
 * @param request HTTP request
 * @param response HTTP response (populated if version request)
 * @return true if this was a version request
 */
inline bool process_version(
    const HttpRequest& request,
    HttpResponse& response
) {
    if (request.path == "/api/version" || request.path == "/version") {
        response.body = R"({"version":"1.0.0","service":"DBAL Daemon"})";
        return true;
    }
    return false;
}

} // namespace daemon
} // namespace dbal
