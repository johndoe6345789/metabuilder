/**
 * @file http_response.hpp
 * @brief HTTP response structure
 */

#pragma once

#include <string>
#include <map>

namespace dbal {
namespace daemon {

/**
 * @struct HttpResponse
 * @brief HTTP response structure
 */
struct HttpResponse {
    int status_code;
    std::string status_text;
    std::map<std::string, std::string> headers;
    std::string body;
    
    HttpResponse() : status_code(200), status_text("OK") {
        headers["Content-Type"] = "application/json";
        headers["Server"] = "DBAL/1.0.0";
    }
};

} // namespace daemon
} // namespace dbal
