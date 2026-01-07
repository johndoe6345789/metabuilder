#include "server.hpp"
#include "server_helpers.hpp"

#include <algorithm>
#include <cctype>
#include <cstdlib>
#include <functional>
#include <json/json.h>
#include <sstream>

#include "dbal/core/errors.hpp"
#include "rpc_user_actions.hpp"
#include "rpc_schema_actions.hpp"
#include "rpc_restful_handler.hpp"

namespace dbal {
namespace daemon {

void Server::registerRoutes() {
    if (routes_registered_) {
        return;
    }

    const std::string server_address = address();

    auto health_handler = [](const drogon::HttpRequestPtr&,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        Json::Value body;
        body["status"] = "healthy";
        body["service"] = "dbal";
        callback(build_json_response(body));
    };

    auto version_handler = [](const drogon::HttpRequestPtr&,
                              std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        Json::Value body;
        body["version"] = "1.0.0";
        body["service"] = "DBAL Daemon";
        callback(build_json_response(body));
    };

    auto status_handler = [server_address](const drogon::HttpRequestPtr& request,
                                           std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        Json::Value body;
        body["status"] = "running";
        body["address"] = server_address;
        body["real_ip"] = resolve_real_ip(request);
        body["forwarded_proto"] = resolve_forwarded_proto(request);
        callback(build_json_response(body));
    };

    auto rpc_handler = [this](const drogon::HttpRequestPtr& request,
                              std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        auto send_error = [&callback](const std::string& message, int status = 400) {
            Json::Value body;
            body["success"] = false;
            body["message"] = message;
            auto response = drogon::HttpResponse::newHttpJsonResponse(body);
            response->setStatusCode(status);
            callback(response);
        };

        std::istringstream stream(request->getBody());
        Json::CharReaderBuilder reader_builder;
        Json::Value rpc_request;
        JSONCPP_STRING errs;
        if (!Json::parseFromStream(reader_builder, stream, &rpc_request, &errs)) {
            send_error("Invalid JSON payload: " + std::string(errs), 400);
            return;
        }

        const std::string entity = rpc_request.get("entity", "").asString();
        std::string action = rpc_request.get("action", rpc_request.get("method", "")).asString();
        if (entity.empty() || action.empty()) {
            send_error("Both entity and action are required");
            return;
        }

        if (!ensureClient()) {
            send_error("DBAL client is unavailable", 503);
            return;
        }

        std::string normalized_entity = entity;
        std::transform(normalized_entity.begin(), normalized_entity.end(), normalized_entity.begin(),
                       [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
        std::transform(action.begin(), action.end(), action.begin(),
                       [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

        const auto payload = rpc_request.get("payload", Json::Value(Json::objectValue));
        const auto options_value = rpc_request.get("options", Json::Value(Json::objectValue));
        const std::string tenant_id = rpc_request.get("tenantId", payload.get("tenantId", "")).asString();

        auto send_success = [&callback](const Json::Value& data) {
            Json::Value body;
            body["success"] = true;
            body["data"] = data;
            callback(build_json_response(body));
        };

        auto send_db_error = [&](const dbal::Error& error) {
            send_error(error.what(), static_cast<int>(error.code()));
        };

        if (normalized_entity != "user") {
            send_error("Unsupported entity: " + entity, 400);
            return;
        }

        if (action == "list") {
            rpc::handle_user_list(*dbal_client_, tenant_id, options_value, send_success, send_error);
            return;
        }

        const auto id = payload.get("id", "").asString();
        if ((action == "get" || action == "read") && id.empty()) {
            send_error("ID is required for read operations");
            return;
        }

        if (action == "get" || action == "read") {
            rpc::handle_user_read(*dbal_client_, tenant_id, id, send_success, send_error);
            return;
        }

        if (action == "create") {
            rpc::handle_user_create(*dbal_client_, tenant_id, payload, send_success, send_error);
            return;
        }

        if (action == "update") {
            rpc::handle_user_update(*dbal_client_, tenant_id, id, payload, send_success, send_error);
            return;
        }

        if (action == "delete" || action == "remove") {
            rpc::handle_user_delete(*dbal_client_, tenant_id, id, send_success, send_error);
            return;
        }

        send_error("Unsupported action: " + action, 400);
    };

    drogon::app().registerHandler("/health", health_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/healthz", health_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/version", version_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/version", version_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/status", status_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/status", status_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/dbal", rpc_handler, {drogon::HttpMethod::Post});

    // Schema management routes
    auto schema_handler = [](const drogon::HttpRequestPtr& request,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        // Get paths from environment or use defaults
        const char* env_registry = std::getenv("DBAL_SCHEMA_REGISTRY_PATH");
        const char* env_packages = std::getenv("DBAL_PACKAGES_PATH");
        const char* env_output = std::getenv("DBAL_PRISMA_OUTPUT_PATH");
        
        const std::string registry_path = env_registry ? env_registry : "/app/prisma/schema-registry.json";
        const std::string packages_path = env_packages ? env_packages : "/app/packages";
        const std::string output_path = env_output ? env_output : "/app/prisma/generated-from-packages.prisma";
        
        auto send_success = [&callback](const Json::Value& data) {
            callback(build_json_response(data));
        };
        
        auto send_error = [&callback](const std::string& message, int status) {
            Json::Value body;
            body["success"] = false;
            body["error"] = message;
            auto response = drogon::HttpResponse::newHttpJsonResponse(body);
            response->setStatusCode(static_cast<drogon::HttpStatusCode>(status));
            callback(response);
        };
        
        // Handle GET - list/status
        if (request->method() == drogon::HttpMethod::Get) {
            rpc::handle_schema_list(registry_path, send_success, send_error);
            return;
        }
        
        // Handle POST - actions
        std::istringstream stream(request->getBody());
        Json::CharReaderBuilder reader_builder;
        Json::Value body;
        JSONCPP_STRING errs;
        if (!Json::parseFromStream(reader_builder, stream, &body, &errs)) {
            send_error("Invalid JSON payload", 400);
            return;
        }
        
        const std::string action = body.get("action", "").asString();
        const std::string id = body.get("id", "").asString();
        
        if (action == "scan") {
            rpc::handle_schema_scan(registry_path, packages_path, send_success, send_error);
        } else if (action == "approve") {
            if (id.empty()) {
                send_error("Migration ID required", 400);
                return;
            }
            rpc::handle_schema_approve(registry_path, id, send_success, send_error);
        } else if (action == "reject") {
            if (id.empty()) {
                send_error("Migration ID required", 400);
                return;
            }
            rpc::handle_schema_reject(registry_path, id, send_success, send_error);
        } else if (action == "generate") {
            rpc::handle_schema_generate(registry_path, output_path, send_success, send_error);
        } else {
            send_error("Unknown action: " + action, 400);
        }
    };
    
    drogon::app().registerHandler("/api/dbal/schema", schema_handler, 
                                  {drogon::HttpMethod::Get, drogon::HttpMethod::Post});

    // RESTful multi-tenant routes: /{tenant}/{package}/{entity}[/{id}[/{action}]]
    // This is a catch-all handler for the RESTful pattern
    auto restful_handler = [this](const drogon::HttpRequestPtr& request,
                                  std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                  const std::string& tenant,
                                  const std::string& package,
                                  const std::string& entity) {
        auto send_success = [&callback](const Json::Value& data) {
            Json::Value body;
            body["success"] = true;
            body["data"] = data;
            callback(build_json_response(body));
        };
        
        auto send_error = [&callback](const std::string& message, int status) {
            Json::Value body;
            body["success"] = false;
            body["error"] = message;
            auto response = drogon::HttpResponse::newHttpJsonResponse(body);
            response->setStatusCode(static_cast<drogon::HttpStatusCode>(status));
            callback(response);
        };

        if (!ensureClient()) {
            send_error("DBAL client is unavailable", 503);
            return;
        }
        
        // Build full path for parsing
        std::string full_path = "/" + tenant + "/" + package + "/" + entity;
        
        // Parse the route
        auto route = rpc::parseRoute(full_path);
        
        // Determine HTTP method
        std::string method;
        switch (request->method()) {
            case drogon::HttpMethod::Get: method = "GET"; break;
            case drogon::HttpMethod::Post: method = "POST"; break;
            case drogon::HttpMethod::Put: method = "PUT"; break;
            case drogon::HttpMethod::Patch: method = "PATCH"; break;
            case drogon::HttpMethod::Delete: method = "DELETE"; break;
            default: method = "UNKNOWN"; break;
        }
        
        // Parse body for POST/PUT/PATCH
        Json::Value body(Json::objectValue);
        if (method == "POST" || method == "PUT" || method == "PATCH") {
            std::istringstream stream(request->getBody());
            Json::CharReaderBuilder reader;
            JSONCPP_STRING errs;
            Json::parseFromStream(reader, stream, &body, &errs);
        }
        
        // Parse query parameters
        std::map<std::string, std::string> query;
        for (const auto& param : request->getParameters()) {
            query[param.first] = param.second;
        }
        
        rpc::handleRestfulRequest(*dbal_client_, route, method, body, query, send_success, send_error);
    };
    
    // Handler with ID
    auto restful_handler_with_id = [this](const drogon::HttpRequestPtr& request,
                                          std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                          const std::string& tenant,
                                          const std::string& package,
                                          const std::string& entity,
                                          const std::string& id) {
        auto send_success = [&callback](const Json::Value& data) {
            Json::Value body;
            body["success"] = true;
            body["data"] = data;
            callback(build_json_response(body));
        };
        
        auto send_error = [&callback](const std::string& message, int status) {
            Json::Value body;
            body["success"] = false;
            body["error"] = message;
            auto response = drogon::HttpResponse::newHttpJsonResponse(body);
            response->setStatusCode(static_cast<drogon::HttpStatusCode>(status));
            callback(response);
        };

        if (!ensureClient()) {
            send_error("DBAL client is unavailable", 503);
            return;
        }
        
        std::string full_path = "/" + tenant + "/" + package + "/" + entity + "/" + id;
        auto route = rpc::parseRoute(full_path);
        
        std::string method;
        switch (request->method()) {
            case drogon::HttpMethod::Get: method = "GET"; break;
            case drogon::HttpMethod::Post: method = "POST"; break;
            case drogon::HttpMethod::Put: method = "PUT"; break;
            case drogon::HttpMethod::Patch: method = "PATCH"; break;
            case drogon::HttpMethod::Delete: method = "DELETE"; break;
            default: method = "UNKNOWN"; break;
        }
        
        Json::Value body(Json::objectValue);
        if (method == "POST" || method == "PUT" || method == "PATCH") {
            std::istringstream stream(request->getBody());
            Json::CharReaderBuilder reader;
            JSONCPP_STRING errs;
            Json::parseFromStream(reader, stream, &body, &errs);
        }
        
        std::map<std::string, std::string> query;
        for (const auto& param : request->getParameters()) {
            query[param.first] = param.second;
        }
        
        rpc::handleRestfulRequest(*dbal_client_, route, method, body, query, send_success, send_error);
    };
    
    // Handler with ID and action
    auto restful_handler_with_action = [this](const drogon::HttpRequestPtr& request,
                                              std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                              const std::string& tenant,
                                              const std::string& package,
                                              const std::string& entity,
                                              const std::string& id,
                                              const std::string& action) {
        auto send_success = [&callback](const Json::Value& data) {
            Json::Value body;
            body["success"] = true;
            body["data"] = data;
            callback(build_json_response(body));
        };
        
        auto send_error = [&callback](const std::string& message, int status) {
            Json::Value body;
            body["success"] = false;
            body["error"] = message;
            auto response = drogon::HttpResponse::newHttpJsonResponse(body);
            response->setStatusCode(static_cast<drogon::HttpStatusCode>(status));
            callback(response);
        };

        if (!ensureClient()) {
            send_error("DBAL client is unavailable", 503);
            return;
        }
        
        std::string full_path = "/" + tenant + "/" + package + "/" + entity + "/" + id + "/" + action;
        auto route = rpc::parseRoute(full_path);
        
        std::string method;
        switch (request->method()) {
            case drogon::HttpMethod::Get: method = "GET"; break;
            case drogon::HttpMethod::Post: method = "POST"; break;
            case drogon::HttpMethod::Put: method = "PUT"; break;
            case drogon::HttpMethod::Patch: method = "PATCH"; break;
            case drogon::HttpMethod::Delete: method = "DELETE"; break;
            default: method = "UNKNOWN"; break;
        }
        
        Json::Value body(Json::objectValue);
        if (method == "POST" || method == "PUT" || method == "PATCH") {
            std::istringstream stream(request->getBody());
            Json::CharReaderBuilder reader;
            JSONCPP_STRING errs;
            Json::parseFromStream(reader, stream, &body, &errs);
        }
        
        std::map<std::string, std::string> query;
        for (const auto& param : request->getParameters()) {
            query[param.first] = param.second;
        }
        
        rpc::handleRestfulRequest(*dbal_client_, route, method, body, query, send_success, send_error);
    };
    
    // Register RESTful routes with path parameters
    // Pattern: /{tenant}/{package}/{entity}
    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}",
        restful_handler,
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post}
    );
    
    // Pattern: /{tenant}/{package}/{entity}/{id}
    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}/{id}",
        restful_handler_with_id,
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post, 
         drogon::HttpMethod::Put, drogon::HttpMethod::Patch, 
         drogon::HttpMethod::Delete}
    );
    
    // Pattern: /{tenant}/{package}/{entity}/{id}/{action}
    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}/{id}/{action}",
        restful_handler_with_action,
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post}
    );

    routes_registered_ = true;
}

} // namespace daemon
} // namespace dbal
