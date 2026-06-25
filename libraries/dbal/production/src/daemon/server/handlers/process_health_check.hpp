/**
 * @file process_health_check.hpp
 * @brief Handle health check endpoints
 */

#pragma once

#include <string>
#include "../request/http_request.hpp"
#include "../response/http_response.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Check if request is a health check and process it
 * @param request HTTP request
 * @param response HTTP response (populated if health check)
 * @return true if this was a health check request
 */
inline bool process_health_check(
    const HttpRequest& request,
    HttpResponse& response
) {
    if (request.path == "/health" || request.path == "/healthz") {
        response.status_code = 200;
        response.status_text = "OK";
        response.body = R"({"status":"healthy","service":"dbal"})";
        return true;
    }
    return false;
}

} // namespace daemon
} // namespace dbal
