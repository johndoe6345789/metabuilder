/**
 * @file server.cpp
 * @brief Drogon-backed HTTP server implementation.
 */

#include "server.hpp"

#include <algorithm>
#include <chrono>
#include <drogon/drogon.h>
#include <functional>
#include <iostream>
#include <json/json.h>
#include <sstream>
#include "dbal/core/errors.hpp"
#include "dbal/core/types.hpp"

namespace {

std::string trim_string(const std::string& value) {
    const auto start = value.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) {
        return "";
    }
    const auto end = value.find_last_not_of(" \t\r\n");
    return value.substr(start, end - start + 1);
}

std::string resolve_real_ip(const drogon::HttpRequestPtr& request) {
    auto real_ip = request->getHeader("X-Real-IP");
    if (!real_ip.empty()) {
        return real_ip;
    }

    auto forwarded_for = request->getHeader("X-Forwarded-For");
    if (!forwarded_for.empty()) {
        const auto comma = forwarded_for.find(',');
        if (comma != std::string::npos) {
            forwarded_for = forwarded_for.substr(0, comma);
        }
        return trim_string(forwarded_for);
    }

    return "";
}

std::string resolve_forwarded_proto(const drogon::HttpRequestPtr& request) {
    auto forwarded_proto = request->getHeader("X-Forwarded-Proto");
    if (!forwarded_proto.empty()) {
        return forwarded_proto;
    }
    return "http";
}

dbal::UserRole normalize_role(const std::string& role) {
    std::string value = role;
    std::transform(value.begin(), value.end(), value.begin(), [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (value == "admin") {
        return dbal::UserRole::Admin;
    }
    if (value == "god") {
        return dbal::UserRole::God;
    }
    if (value == "supergod") {
        return dbal::UserRole::SuperGod;
    }
    return dbal::UserRole::User;
}

std::string role_to_string(dbal::UserRole role) {
    switch (role) {
        case dbal::UserRole::Admin:
            return "admin";
        case dbal::UserRole::God:
            return "god";
        case dbal::UserRole::SuperGod:
            return "supergod";
        default:
            return "user";
    }
}

long long timestamp_to_epoch_ms(const dbal::Timestamp& timestamp) {
    return std::chrono::duration_cast<std::chrono::milliseconds>(timestamp.time_since_epoch()).count();
}

Json::Value user_to_json(const dbal::User& user) {
    Json::Value value(Json::objectValue);
    value["id"] = user.id;
    value["username"] = user.username;
    value["email"] = user.email;
    value["role"] = role_to_string(user.role);
    value["createdAt"] = static_cast<Json::Int64>(timestamp_to_epoch_ms(user.created_at));
    value["updatedAt"] = static_cast<Json::Int64>(timestamp_to_epoch_ms(user.updated_at));
    return value;
}

Json::Value users_to_json(const std::vector<dbal::User>& users) {
    Json::Value arr(Json::arrayValue);
    for (const auto& user : users) {
        arr.append(user_to_json(user));
    }
    return arr;
}

dbal::ListOptions list_options_from_json(const Json::Value& json) {
    dbal::ListOptions options;
    if (!json.isNull()) {
        if (json.isMember("page") && json["page"].isInt()) {
            options.page = json["page"].asInt();
        }
        if (json.isMember("limit") && json["limit"].isInt()) {
            options.limit = json["limit"].asInt();
        }
        if (json.isMember("filter") && json["filter"].isObject()) {
            for (const auto& key : json["filter"].getMemberNames()) {
                options.filter[key] = json["filter"][key].asString();
            }
        }
        if (json.isMember("sort") && json["sort"].isObject()) {
            for (const auto& key : json["sort"].getMemberNames()) {
                options.sort[key] = json["sort"][key].asString();
            }
        }
    }
    return options;
}

Json::Value list_response_value(const std::vector<dbal::User>& users, const dbal::ListOptions& options) {
    Json::Value value(Json::objectValue);
    value["data"] = users_to_json(users);
    value["total"] = static_cast<Json::Int64>(users.size());
    value["page"] = options.page;
    value["limit"] = options.limit;
    value["hasMore"] = Json::Value(false);
    return value;
}

drogon::HttpResponsePtr build_json_response(const Json::Value& body) {
    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->addHeader("Server", "DBAL/1.0.0");
    return response;
}

} // namespace

namespace dbal {
namespace daemon {

Server::Server(const std::string& bind_address, int port, const dbal::ClientConfig& client_config)
    : bind_address_(bind_address),
      port_(port),
      running_(false),
      routes_registered_(false),
      client_config_(client_config),
      dbal_client_(nullptr) {}

Server::~Server() {
    stop();
}

bool Server::start() {
    if (running_.load()) {
        return true;
    }

    registerRoutes();
    drogon::app().addListener(bind_address_, static_cast<uint16_t>(port_));

    running_.store(true);
    server_thread_ = std::thread(&Server::runServer, this);
    return true;
}

void Server::stop() {
    if (!running_.load()) {
        return;
    }

    drogon::app().quit();
    if (server_thread_.joinable()) {
        server_thread_.join();
    }
    running_.store(false);
}

bool Server::isRunning() const {
    return running_.load();
}

std::string Server::address() const {
    return bind_address_ + ":" + std::to_string(port_);
}

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

    drogon::app().registerHandler("/health", health_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/healthz", health_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/version", version_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/version", version_handler, {drogon::HttpMethod::Get});
++ 
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
    drogon::app().registerHandler("/status", status_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/status", status_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/dbal", rpc_handler, {drogon::HttpMethod::Post});

    drogon::app().registerHandler("/status", status_handler, {drogon::HttpMethod::Get});
    drogon::app().registerHandler("/api/status", status_handler, {drogon::HttpMethod::Get});

    routes_registered_ = true;
}

void Server::runServer() {
    drogon::app().run();
    running_.store(false);
}

} // namespace daemon
} // namespace dbal
