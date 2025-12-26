#include "server.hpp"
#include "server_helpers.hpp"

#include <algorithm>
#include <cctype>
#include <functional>
#include <json/json.h>
#include <sstream>

#include "dbal/core/errors.hpp"

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
            auto options = list_options_from_json(options_value);
            auto result = dbal_client_->listUsers(options);
            if (!result.isOk()) {
                send_db_error(result.error());
                return;
            }
            send_success(list_response_value(result.value(), options));
            return;
        }

        const auto id = payload.get("id", "").asString();
        if ((action == "get" || action == "read") && id.empty()) {
            send_error("ID is required for read operations");
            return;
        }

        if (action == "get" || action == "read") {
            auto result = dbal_client_->getUser(id);
            if (!result.isOk()) {
                send_db_error(result.error());
                return;
            }
            send_success(user_to_json(result.value()));
            return;
        }

        if (action == "create") {
            const auto username = payload.get("username", "").asString();
            const auto email = payload.get("email", "").asString();
            if (username.empty() || email.empty()) {
                send_error("Username and email are required for creation");
                return;
            }

            dbal::CreateUserInput input;
            input.username = username;
            input.email = email;
            if (payload.isMember("role") && payload["role"].isString()) {
                input.role = normalize_role(payload["role"].asString());
            }

            auto result = dbal_client_->createUser(input);
            if (!result.isOk()) {
                send_db_error(result.error());
                return;
            }

            send_success(user_to_json(result.value()));
            return;
        }

        if (action == "update") {
            if (id.empty()) {
                send_error("ID is required for updates");
                return;
            }

            dbal::UpdateUserInput updates;
            bool has_updates = false;
            if (payload.isMember("username") && payload["username"].isString()) {
                updates.username = payload["username"].asString();
                has_updates = true;
            }
            if (payload.isMember("email") && payload["email"].isString()) {
                updates.email = payload["email"].asString();
                has_updates = true;
            }
            if (payload.isMember("role") && payload["role"].isString()) {
                updates.role = normalize_role(payload["role"].asString());
                has_updates = true;
            }

            if (!has_updates) {
                send_error("At least one update field must be provided");
                return;
            }

            auto result = dbal_client_->updateUser(id, updates);
            if (!result.isOk()) {
                send_db_error(result.error());
                return;
            }

            send_success(user_to_json(result.value()));
            return;
        }

        if (action == "delete" || action == "remove") {
            if (id.empty()) {
                send_error("ID is required for delete operations");
                return;
            }

            auto result = dbal_client_->deleteUser(id);
            if (!result.isOk()) {
                send_db_error(result.error());
                return;
            }

            Json::Value body;
            body["deleted"] = result.value();
            send_success(body);
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
