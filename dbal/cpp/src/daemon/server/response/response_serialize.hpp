/**
 * @file response_serialize.hpp
 * @brief Serialize HTTP response to string
 */

#pragma once

#include <string>
#include <sstream>
#include "http_response.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Serialize HTTP response to wire format
 * @param response The HTTP response
 * @return Serialized response string
 */
inline std::string response_serialize(const HttpResponse& response) {
    std::ostringstream oss;
    oss << "HTTP/1.1 " << response.status_code << " " << response.status_text << "\r\n";
    
    // Add Content-Length if not already set
    auto cl_it = response.headers.find("Content-Length");
    if (cl_it == response.headers.end()) {
        oss << "Content-Length: " << response.body.length() << "\r\n";
    }
    
    for (const auto& h : response.headers) {
        oss << h.first << ": " << h.second << "\r\n";
    }
    
    oss << "\r\n" << response.body;
    return oss.str();
}

} // namespace daemon
} // namespace dbal
