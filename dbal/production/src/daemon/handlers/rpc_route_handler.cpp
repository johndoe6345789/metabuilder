/**
 * @file rpc_route_handler.cpp
 * @brief Implementation of RPC-style endpoint handler
 */

#include "rpc_route_handler.hpp"
#include "../rpc_user_actions.hpp"
#include "../server_helpers/response.hpp"
#include "dbal/core/errors.hpp"
#include <algorithm>
#include <cctype>
#include <drogon/HttpTypes.h>
#include <json/json.h>
#include <spdlog/spdlog.h>
#include <sstream>

namespace dbal {
namespace daemon {
namespace handlers {

RpcRouteHandler::RpcRouteHandler(dbal::Client& client)
    : client_(client) {}

void RpcRouteHandler::handleRpc(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) {
    spdlog::trace("RPC handler called, method={}, path={}", request->getMethodString(), request->path());

    // Reject oversized request bodies
    constexpr size_t MAX_REQUEST_BODY_SIZE = 10 * 1024 * 1024; // 10MB
    if (request->getBody().size() > MAX_REQUEST_BODY_SIZE) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Request body too large";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k413RequestEntityTooLarge);
        callback(resp);
        return;
    }

    auto send_error = [&callback](const std::string& message, int status = 400) {
        spdlog::trace("RPC sending error: {} (status={})", message, status);
        ::Json::Value body;
        body["success"] = false;
        body["message"] = message;
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(static_cast<drogon::HttpStatusCode>(status));
        callback(response);
    };

    // Parse JSON body
    spdlog::trace("RPC parsing JSON body length={}", request->getBody().size());
    std::istringstream stream(std::string(request->getBody()));
    ::Json::CharReaderBuilder reader_builder;
    ::Json::Value rpc_request;
    JSONCPP_STRING errs;
    if (!::Json::parseFromStream(reader_builder, stream, &rpc_request, &errs)) {
        spdlog::trace("RPC JSON parse failed: {}", errs);
        send_error("Invalid JSON payload: " + std::string(errs), 400);
        return;
    }

    // Extract entity and action
    const std::string entity = rpc_request.get("entity", "").asString();
    std::string action = rpc_request.get("action", rpc_request.get("method", "")).asString();
    spdlog::trace("RPC entity='{}', action='{}'", entity, action);

    if (entity.empty() || action.empty()) {
        spdlog::trace("RPC missing entity or action");
        send_error("Both entity and action are required");
        return;
    }

    // Normalize entity and action to lowercase
    std::string normalized_entity = entity;
    std::transform(normalized_entity.begin(), normalized_entity.end(), normalized_entity.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    std::transform(action.begin(), action.end(), action.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

    const auto payload = rpc_request.get("payload", ::Json::Value(::Json::objectValue));
    const auto options_value = rpc_request.get("options", ::Json::Value(::Json::objectValue));
    const std::string tenantId = rpc_request.get("tenantId", payload.get("tenantId", "")).asString();

    spdlog::trace("RPC normalized_entity='{}', action='{}', tenantId='{}'", normalized_entity, action, tenantId);

    auto send_success = [&callback](const ::Json::Value& data) {
        spdlog::trace("RPC sending success response");
        ::Json::Value body;
        body["success"] = true;
        body["data"] = data;
        callback(build_json_response(body));
    };

    auto send_db_error = [&](const dbal::Error& error) {
        send_error(error.what(), static_cast<int>(error.code()));
    };

    // Only support user entity for now (legacy RPC)
    if (normalized_entity != "user") {
        spdlog::trace("RPC unsupported entity: {}", entity);
        send_error("Unsupported entity: " + entity, 400);
        return;
    }

    // Dispatch to user actions
    if (action == "list") {
        spdlog::trace("RPC dispatching to handle_user_list");
        rpc::handle_user_list(client_, tenantId, options_value, send_success, send_error);
        return;
    }

    const auto id = payload.get("id", "").asString();
    if ((action == "get" || action == "read") && id.empty()) {
        spdlog::trace("RPC read operation missing ID");
        send_error("ID is required for read operations");
        return;
    }

    if (action == "get" || action == "read") {
        spdlog::trace("RPC dispatching to handle_user_read, id='{}'", id);
        rpc::handle_user_read(client_, tenantId, id, send_success, send_error);
        return;
    }

    if (action == "create") {
        spdlog::trace("RPC dispatching to handle_user_create");
        rpc::handle_user_create(client_, tenantId, payload, send_success, send_error);
        return;
    }

    if (action == "update") {
        spdlog::trace("RPC dispatching to handle_user_update, id='{}'", id);
        rpc::handle_user_update(client_, tenantId, id, payload, send_success, send_error);
        return;
    }

    if (action == "delete" || action == "remove") {
        spdlog::trace("RPC dispatching to handle_user_delete, id='{}'", id);
        rpc::handle_user_delete(client_, tenantId, id, send_success, send_error);
        return;
    }

    spdlog::trace("RPC unsupported action: {}", action);
    send_error("Unsupported action: " + action, 400);
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
