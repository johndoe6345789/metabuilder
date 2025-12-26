/**
 * @file server_process_request.hpp
 * @brief Server request processing implementation
 */

#pragma once

#include "server.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Process request and generate response
 */
inline HttpResponse Server::processRequest(const HttpRequest& request) {
    HttpResponse response;
    
    if (process_health_check(request, response)) {
        return response;
    }
    
    if (process_version(request, response)) {
        return response;
    }
    
    if (process_status(request, address(), response)) {
        return response;
    }
    
    process_not_found(request, response);
    return response;
}

} // namespace daemon
} // namespace dbal
