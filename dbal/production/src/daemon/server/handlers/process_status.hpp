/**
 * @file process_status.hpp
 * @brief Handle status endpoint
 */

#pragma once

#include <string>
#include <sstream>
#include "../request/http_request.hpp"
#include "../response/http_response.hpp"
#include "../request/request_real_ip.hpp"
#include "../request/request_forwarded_proto.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Check if request is a status request and process it
 * @param request HTTP request
 * @param address Server address
 * @param response HTTP response (populated if status request)
 * @return true if this was a status request
 */
inline bool process_status(
    const HttpRequest& request,
    const std::string& address,
    HttpResponse& response
) {
    if (request.path == "/api/status" || request.path == "/status") {
        std::ostringstream body;
        body << R"({"status":"running","address":")" << address << R"(")"
             << R"(,"real_ip":")" << request_real_ip(request) << R"(")"
             << R"(,"forwarded_proto":")" << request_forwarded_proto(request) << R"(")"
             << "}";
        response.body = body.str();
        return true;
    }
    return false;
}

} // namespace daemon
} // namespace dbal
