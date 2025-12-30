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
            rpc::handle_user_list(*dbal_client_, options_value, send_success, send_error);
            return;
        }

        const auto id = payload.get("id", "").asString();
        if ((action == "get" || action == "read") && id.empty()) {
            send_error("ID is required for read operations");
            return;
        }

        if (action == "get" || action == "read") {
            rpc::handle_user_read(*dbal_client_, id, send_success, send_error);
            return;
        }

        if (action == "create") {
            rpc::handle_user_create(*dbal_client_, payload, send_success, send_error);
            return;
        }

        if (action == "update") {
            rpc::handle_user_update(*dbal_client_, id, payload, send_success, send_error);
            return;
        }

        if (action == "delete" || action == "remove") {
            rpc::handle_user_delete(*dbal_client_, id, send_success, send_error);
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

    routes_registered_ = true;
}

} // namespace daemon
} // namespace dbal
