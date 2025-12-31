/**
 * @file http_request.hpp
 * @brief HTTP request structure
 */

#pragma once

#include <string>
#include <map>

namespace dbal {
namespace daemon {

/**
 * @struct HttpRequest
 * @brief Parsed HTTP request structure
 */
struct HttpRequest {
    std::string method;
    std::string path;
    std::string version;
    std::map<std::string, std::string> headers;
    std::string body;
};

} // namespace daemon
} // namespace dbal
