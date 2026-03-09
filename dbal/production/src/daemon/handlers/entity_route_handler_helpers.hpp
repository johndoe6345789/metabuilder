/**
 * @file entity_route_handler_helpers.hpp
 * @brief Helper functions for entity route handling
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <json/json.h>
#include <functional>
#include <map>
#include <string>

namespace dbal {
namespace daemon {
namespace handlers {

/**
 * @brief Pair of success and error response callbacks
 */
struct ResponseCallbackPair {
    std::function<void(const ::Json::Value&)> send_success;
    std::function<void(const std::string&, int)> send_error;
};

/**
 * @brief Create standardized success/error response callbacks
 * @param callback The Drogon HTTP response callback
 * @return Pair of success and error callback functions
 */
ResponseCallbackPair createResponseCallbacks(
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
);

/**
 * @brief Parse HTTP method from Drogon request
 * @param request The HTTP request
 * @return Method string (GET, POST, PUT, PATCH, DELETE, UNKNOWN)
 */
std::string parseHttpMethod(const drogon::HttpRequestPtr& request);

/**
 * @brief Parse JSON body from request for POST/PUT/PATCH methods
 * @param request The HTTP request
 * @param method The HTTP method string
 * @return Parsed JSON value (empty object if not applicable)
 */
::Json::Value parseRequestBody(
    const drogon::HttpRequestPtr& request,
    const std::string& method
);

/**
 * @brief Parse query parameters from request
 * @param request The HTTP request
 * @return Map of query parameter key-value pairs
 */
std::map<std::string, std::string> parseQueryParameters(
    const drogon::HttpRequestPtr& request
);

/**
 * @brief Send standardized error response for exceptions
 * @param callback The HTTP response callback
 * @param error_message The error message to send
 */
void sendErrorResponse(
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& error_message
);

} // namespace handlers
} // namespace daemon
} // namespace dbal
