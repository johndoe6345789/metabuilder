/**
 * @file admin_route_handler.cpp
 * @brief Admin API endpoints for runtime database configuration
 */

#include "admin_route_handler.hpp"
#include "../server_helpers/response.hpp"
#include "dbal/core/adapter_factory.hpp"

#include <cstdlib>
#include <cstring>
#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {
namespace handlers {

AdminRouteHandler::AdminRouteHandler(ConfigGetter getConfig, SwitchCallback switchFn, TestCallback testFn)
    : getConfig_(std::move(getConfig)),
      switchAdapter_(std::move(switchFn)),
      testConnection_(std::move(testFn)) {}

bool AdminRouteHandler::validateAdminAuth(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback
) const {
    const char* expected_token = std::getenv("DBAL_ADMIN_TOKEN");
    if (!expected_token || std::strlen(expected_token) == 0) {
        // No token configured = admin endpoints disabled
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Admin endpoints are disabled (no DBAL_ADMIN_TOKEN configured)";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k403Forbidden);
        callback(resp);
        return false;
    }
    auto auth_header = request->getHeader("Authorization");
    if (auth_header.empty() || auth_header != std::string("Bearer ") + expected_token) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Unauthorized";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k401Unauthorized);
        callback(resp);
        return false;
    }
    return true;
}

void AdminRouteHandler::applyCorsHeaders(
    const drogon::HttpRequestPtr& request,
    const drogon::HttpResponsePtr& response
) const {
    auto origin = request->getHeader("Origin");
    if (!origin.empty()) {
        // Only allow configured origins, default to localhost
        const char* allowed = std::getenv("DBAL_CORS_ORIGIN");
        std::string allowed_origin = allowed ? allowed : "http://localhost:3000";
        if (origin == allowed_origin) {
            response->addHeader("Access-Control-Allow-Origin", allowed_origin);
        }
    }
}

// GET /api/admin/config — return current adapter type + redacted URL + status
void AdminRouteHandler::handleGetConfig(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) const {
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        applyCorsHeaders(request, response);
        response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        callback(response);
        return;
    }

    if (!validateAdminAuth(request, callback)) {
        return;
    }

    auto [adapter, url] = getConfig_();

    // Redact password from URL for display
    std::string redacted = url;
    size_t at = redacted.find('@');
    size_t colon = redacted.find(':', redacted.find("://") + 3);
    if (at != std::string::npos && colon != std::string::npos && colon < at) {
        redacted = redacted.substr(0, colon + 1) + "***" + redacted.substr(at);
    }

    ::Json::Value body;
    body["success"] = true;
    body["data"]["adapter"] = adapter;
    body["data"]["database_url"] = redacted;
    body["data"]["status"] = "connected";

    callback(build_json_response(body));
}

// POST /api/admin/config — switch adapter at runtime
void AdminRouteHandler::handlePostConfig(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) {
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        applyCorsHeaders(request, response);
        response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        callback(response);
        return;
    }

    if (!validateAdminAuth(request, callback)) {
        return;
    }

    auto jsonPtr = request->getJsonObject();
    if (!jsonPtr) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Invalid JSON body";
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
        callback(response);
        return;
    }

    const auto& json = *jsonPtr;
    std::string adapter = json.get("adapter", "").asString();
    std::string database_url = json.get("database_url", "").asString();

    if (adapter.empty() || database_url.empty()) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Both 'adapter' and 'database_url' are required";
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
        callback(response);
        return;
    }

    if (!core::AdapterFactory::isSupported(adapter)) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Unsupported adapter type: " + adapter;
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
        callback(response);
        return;
    }

    spdlog::info("Admin API: switching adapter to '{}' with URL '{}'", adapter, database_url.substr(0, 30) + "...");

    if (switchAdapter_(adapter, database_url)) {
        ::Json::Value body;
        body["success"] = true;
        body["message"] = "Switched to " + adapter + " adapter";
        callback(build_json_response(body));
    } else {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Failed to switch adapter — previous adapter still active";
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k500InternalServerError);
        callback(response);
    }
}

// GET /api/admin/adapters — list all supported backends
void AdminRouteHandler::handleGetAdapters(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) const {
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        applyCorsHeaders(request, response);
        response->addHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        response->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        callback(response);
        return;
    }

    if (!validateAdminAuth(request, callback)) {
        return;
    }

    auto [currentAdapter, _url] = getConfig_();
    (void)_url;

    // All adapters the factory knows about
    static const std::vector<std::pair<std::string, std::string>> all_adapters = {
        {"sqlite",        "SQLite (embedded)"},
        {"postgres",      "PostgreSQL"},
        {"mysql",         "MySQL"},
        {"mongodb",       "MongoDB"},
        {"redis",         "Redis (cache layer)"},
        {"elasticsearch", "Elasticsearch (search)"},
        {"cassandra",     "Apache Cassandra"},
        {"surrealdb",     "SurrealDB"},
        {"supabase",      "Supabase"},
        {"prisma",        "Prisma (ORM bridge)"},
        {"dynamodb",      "AWS DynamoDB"},
        {"cockroachdb",   "CockroachDB"},
        {"tidb",          "TiDB"},
    };

    ::Json::Value adapters(::Json::arrayValue);
    for (const auto& [name, desc] : all_adapters) {
        ::Json::Value entry;
        entry["name"] = name;
        entry["description"] = desc;
        entry["supported"] = core::AdapterFactory::isSupported(name);
        entry["active"] = (name == currentAdapter);
        adapters.append(entry);
    }

    ::Json::Value body;
    body["success"] = true;
    body["data"] = adapters;

    callback(build_json_response(body));
}

// POST /api/admin/test-connection — test a connection without switching
void AdminRouteHandler::handleTestConnection(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) {
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        applyCorsHeaders(request, response);
        response->addHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        callback(response);
        return;
    }

    if (!validateAdminAuth(request, callback)) {
        return;
    }

    auto jsonPtr = request->getJsonObject();
    if (!jsonPtr) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Invalid JSON body";
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
        callback(response);
        return;
    }

    const auto& json = *jsonPtr;
    std::string adapter = json.get("adapter", "").asString();
    std::string database_url = json.get("database_url", "").asString();

    if (adapter.empty() || database_url.empty()) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Both 'adapter' and 'database_url' are required";
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
        callback(response);
        return;
    }

    if (!core::AdapterFactory::isSupported(adapter)) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Unsupported adapter type: " + adapter;
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
        callback(response);
        return;
    }

    std::string error;
    bool ok = testConnection_(adapter, database_url, error);

    ::Json::Value body;
    body["success"] = ok;
    if (ok) {
        body["message"] = "Connection to " + adapter + " succeeded";
    } else {
        body["error"] = error.empty() ? "Connection failed" : error;
    }

    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    if (!ok) {
        response->setStatusCode(drogon::HttpStatusCode::k422UnprocessableEntity);
    }
    callback(response);
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
