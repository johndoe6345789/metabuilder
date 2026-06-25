/**
 * @file entity_route_handler_helpers.cpp
 * @brief Helper functions for entity route handling
 */

#include "entity_route_handler_helpers.hpp"
#include "../server_helpers/response.hpp"
#include <drogon/HttpTypes.h>
#include <json/json.h>
#include <spdlog/spdlog.h>
#include <sstream>

namespace dbal {
namespace daemon {
namespace handlers {

ResponseCallbackPair createResponseCallbacks(
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) {
    auto send_success = [callback](const ::Json::Value& data) {
        ::Json::Value body;
        body["success"] = true;
        body["data"] = data;
        callback(build_json_response(body));
    };

    auto send_error = [callback](const std::string& message, int status) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = message;
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(static_cast<drogon::HttpStatusCode>(status));
        callback(response);
    };

    return {send_success, send_error};
}

std::string parseHttpMethod(const drogon::HttpRequestPtr& request) {
    switch (request->method()) {
        case drogon::HttpMethod::Get: return "GET";
        case drogon::HttpMethod::Post: return "POST";
        case drogon::HttpMethod::Put: return "PUT";
        case drogon::HttpMethod::Patch: return "PATCH";
        case drogon::HttpMethod::Delete: return "DELETE";
        default: return "UNKNOWN";
    }
}

::Json::Value parseRequestBody(
    const drogon::HttpRequestPtr& request,
    const std::string& method
) {
    ::Json::Value body(::Json::objectValue);

    if (method == "POST" || method == "PUT" || method == "PATCH") {
        std::istringstream stream(std::string(request->getBody()));
        ::Json::CharReaderBuilder reader;
        JSONCPP_STRING errs;
        if (!::Json::parseFromStream(reader, stream, &body, &errs) || !errs.empty()) {
            spdlog::warn("JSON parse error: {}", errs);
            // Return empty object body — caller should check for required fields
            body = ::Json::Value(::Json::objectValue);
        }
    }

    return body;
}

std::map<std::string, std::string> parseQueryParameters(
    const drogon::HttpRequestPtr& request
) {
    std::map<std::string, std::string> query;
    for (const auto& param : request->getParameters()) {
        query[param.first] = param.second;
    }
    return query;
}

void sendErrorResponse(
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& error_message
) {
    ::Json::Value body;
    body["success"] = false;
    body["error"] = error_message;
    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->setStatusCode(drogon::HttpStatusCode::k500InternalServerError);
    callback(response);
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
