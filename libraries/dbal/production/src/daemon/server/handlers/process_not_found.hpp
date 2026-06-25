/**
 * @file process_not_found.hpp
 * @brief Handle 404 not found response
 */

#pragma once

#include <string>
#include "../request/http_request.hpp"
#include "../response/http_response.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Generate 404 not found response
 * @param request HTTP request
 * @param response HTTP response to populate
 */
inline void process_not_found(
    const HttpRequest& request,
    HttpResponse& response
) {
    response.status_code = 404;
    response.status_text = "Not Found";
    response.body = R"({"error":"Not Found","path":")" + request.path + "\"}";
}

} // namespace daemon
} // namespace dbal
