/**
 * @file entity_route_handler_crud.cpp
 * @brief Implementation of RESTful entity CRUD route handlers
 */

#include "entity_route_handler.hpp"
#include "entity_route_handler_helpers.hpp"
#include "entity_validator.hpp"
#include "../rpc_restful_handler.hpp"
#include "../json_convert.hpp"
#include "workflow/wf_engine.hpp"
#include <spdlog/spdlog.h>
#include <json/json.h>

namespace dbal {
namespace daemon {
namespace handlers {

EntityRouteHandler::EntityRouteHandler(dbal::Client& client,
                                       dbal::workflow::WfEngine* wf_engine)
    : client_(client), wf_engine_(wf_engine) {}

void EntityRouteHandler::handleEntity(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& entity,
    std::optional<AuthContext> auth
) {
    try {
        spdlog::trace("Entity handler: /{}/{}/{} method={}",
            tenant, package, entity, request->getMethodString());

        auto callbacks = createResponseCallbacks(std::move(callback));
        std::string full_path = "/" + tenant + "/" + package + "/" + entity;
        auto route = rpc::parseRoute(full_path);
        std::string method = parseHttpMethod(request);
        ::Json::Value body = parseRequestBody(request, method);
        auto query = parseQueryParameters(request);

        if (auth) {
            if (method == "POST" && auth->config.inject_owner) {
                // Server-authoritative: always overwrite any client-supplied userId/tenantId
                body["userId"]   = auth->user_id;
                body["tenantId"] = auth->tenant_id;
                spdlog::debug("[auth] Injected owner userId={} tenantId={}",
                              auth->user_id, auth->tenant_id);
            }
            if (method == "GET" && auth->config.filter_by_owner) {
                // Restrict list to the authenticated user's records
                // ListHandler requires the "filter." prefix to apply as a WHERE clause
                query["filter.userId"] = auth->user_id;
                spdlog::debug("[auth] Filtering list by userId={}", auth->user_id);
            }
        }

        // Logic validation (POST = create, PATCH/PUT = update)
        if (method == "POST" || method == "PATCH" || method == "PUT") {
            auto schema_result = client_.adapter().getEntitySchema(route.entity);
            if (schema_result.isOk()) {
                auto errs = validateEntityData(
                    schema_result.value(),
                    jsoncpp_to_nlohmann(body),
                    method == "POST"
                );
                if (!errs.empty()) {
                    ::Json::Value err_body(::Json::objectValue);
                    err_body["success"] = false;
                    err_body["error"] = "Validation failed";
                    ::Json::Value fields(::Json::arrayValue);
                    for (const auto& e : errs) {
                        ::Json::Value entry(::Json::objectValue);
                        entry["field"]   = e.field;
                        entry["message"] = e.message;
                        fields.append(entry);
                    }
                    err_body["fields"] = fields;
                    callbacks.send_error(err_body.toStyledString(), 422);
                    return;
                }
            }
        }

        // Wrap send_success on POST to fire workflow events after the HTTP response
        if (method == "POST" && wf_engine_) {
            std::string event_name = tenant + "." + entity + ".created";
            if (wf_engine_->hasEvent(event_name)) {
                auto orig_success = callbacks.send_success;
                auto* engine = wf_engine_;
                callbacks.send_success = [orig_success, engine, event_name](const ::Json::Value& result) {
                    orig_success(result);
                    engine->dispatchAsync(event_name, jsoncpp_to_nlohmann(result));
                };
            }
        }

        rpc::handleRestfulRequest(
            client_,
            route,
            method,
            body,
            query,
            callbacks.send_success,
            callbacks.send_error
        );
    } catch (const std::exception& e) {
        spdlog::error("Entity handler exception: {}", e.what());
        sendErrorResponse(std::move(callback), "Internal server error");
    }
}

void EntityRouteHandler::handleEntityWithId(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& entity,
    const std::string& id,
    std::optional<AuthContext> auth
) {
    try {
        spdlog::trace("Entity+ID handler: /{}/{}/{}/{} method={}",
            tenant, package, entity, id, request->getMethodString());

        auto callbacks = createResponseCallbacks(std::move(callback));
        std::string full_path = "/" + tenant + "/" + package + "/" + entity + "/" + id;
        auto route = rpc::parseRoute(full_path);
        std::string method = parseHttpMethod(request);
        ::Json::Value body = parseRequestBody(request, method);
        auto query = parseQueryParameters(request);

        // Ownership check: fetch the entity and compare userId before allowing mutation/read
        // Use route.entity (raw name, e.g. "Snippet") — same as crud_handler.cpp
        if (auth && auth->config.check_ownership) {
            auto result = client_.getEntity(route.entity, id);
            if (!result.isOk()) {
                callbacks.send_error("Entity not found", 404);
                return;
            }
            auto& stored = result.value();
            std::string owner = stored.value("userId", std::string{});
            if (owner != auth->user_id) {
                spdlog::debug("[auth] Ownership denied: entity.userId={} jwt.sub={}",
                              owner, auth->user_id);
                callbacks.send_error("Forbidden", 403);
                return;
            }
        }

        rpc::handleRestfulRequest(
            client_,
            route,
            method,
            body,
            query,
            callbacks.send_success,
            callbacks.send_error
        );
    } catch (const std::exception& e) {
        spdlog::error("Entity handler exception: {}", e.what());
        sendErrorResponse(std::move(callback), "Internal server error");
    }
}

void EntityRouteHandler::handleEntityAction(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& entity,
    const std::string& id,
    const std::string& action
) {
    try {
        spdlog::trace("Entity action handler: /{}/{}/{}/{}/{} method={}",
            tenant, package, entity, id, action, request->getMethodString());

        auto callbacks = createResponseCallbacks(std::move(callback));
        std::string full_path = "/" + tenant + "/" + package + "/" + entity + "/" + id + "/" + action;
        auto route = rpc::parseRoute(full_path);
        std::string method = parseHttpMethod(request);
        ::Json::Value body = parseRequestBody(request, method);
        auto query = parseQueryParameters(request);

        rpc::handleRestfulRequest(
            client_,
            route,
            method,
            body,
            query,
            callbacks.send_success,
            callbacks.send_error
        );
    } catch (const std::exception& e) {
        spdlog::error("Entity handler exception: {}", e.what());
        sendErrorResponse(std::move(callback), "Internal server error");
    }
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
