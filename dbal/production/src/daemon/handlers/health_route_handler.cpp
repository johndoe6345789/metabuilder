/**
 * @file health_route_handler.cpp
 * @brief Implementation of health check endpoints
 */

#include "health_route_handler.hpp"
#include "../server_helpers/response.hpp"
#include <drogon/HttpTypes.h>
#include <json/json.h>
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {
namespace handlers {

HealthRouteHandler::HealthRouteHandler(const std::string& server_address)
    : server_address_(server_address) {}

void HealthRouteHandler::handleHealth(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) const {
    // Handle OPTIONS for CORS
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        response->addHeader("Access-Control-Allow-Origin", "*");
        response->addHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        callback(response);
        return;
    }

    ::Json::Value body;
    body["status"] = "healthy";
    body["service"] = "dbal";
    callback(build_json_response(body));
}

void HealthRouteHandler::handleVersion(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) const {
    // Handle OPTIONS for CORS
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        response->addHeader("Access-Control-Allow-Origin", "*");
        response->addHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        callback(response);
        return;
    }

    ::Json::Value body;
    body["version"] = "1.2.1";
    body["service"] = "DBAL Daemon";
    callback(build_json_response(body));
}

void HealthRouteHandler::handleStatus(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) const {
    // Handle OPTIONS for CORS
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        response->addHeader("Access-Control-Allow-Origin", "*");
        response->addHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        callback(response);
        return;
    }

    try {
        // Build JSON manually to avoid jsoncpp "length too big for prefixing" bug
        // Use stored server_address_ instead of building dynamically
        std::string json_body = "{\"status\":\"running\",\"address\":\"" + server_address_ + "\"}";

        auto response = drogon::HttpResponse::newHttpResponse();
        response->setBody(json_body);
        response->setContentTypeCode(drogon::CT_APPLICATION_JSON);
        response->setStatusCode(drogon::HttpStatusCode::k200OK);
        callback(response);
    } catch (const std::exception& e) {
        spdlog::error("Exception in status handler: {}", e.what());
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setBody("{\"error\":\"Internal server error\"}");
        response->setContentTypeCode(drogon::CT_APPLICATION_JSON);
        response->setStatusCode(drogon::HttpStatusCode::k500InternalServerError);
        callback(response);
    }
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
