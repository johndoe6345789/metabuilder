/**
 * @file request_forwarded_proto.hpp
 * @brief Extract forwarded protocol from nginx headers
 */

#pragma once

#include <string>
#include "http_request.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Get forwarded protocol from X-Forwarded-Proto header
 * @param request The HTTP request
 * @return Protocol string (defaults to "http")
 */
inline std::string request_forwarded_proto(const HttpRequest& request) {
    auto it = request.headers.find("X-Forwarded-Proto");
    return it != request.headers.end() ? it->second : "http";
}

} // namespace daemon
} // namespace dbal
