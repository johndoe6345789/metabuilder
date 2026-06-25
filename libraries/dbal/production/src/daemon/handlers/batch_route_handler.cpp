/**
 * @file batch_route_handler.cpp
 * @brief Multi-entity batch operations endpoint handler
 */

#include "batch_route_handler.hpp"
#include "entity_route_handler_helpers.hpp"
#include "../json_convert.hpp"
#include "../rpc_restful_handler.hpp"
#include "../server_helpers/response.hpp"

#include <drogon/drogon.h>
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>
#include <sstream>

namespace dbal {
namespace daemon {
namespace handlers {

BatchRouteHandler::BatchRouteHandler(dbal::Client& client)
    : client_(client) {}

void BatchRouteHandler::handleBatch(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package
) {
    try {
        spdlog::trace("BatchRouteHandler: /{}/{}/_batch", tenant, package);

        // Parse the JSON body
        std::string bodyStr(request->getBody());
        ::Json::Value body;
        {
            std::istringstream stream(bodyStr);
            ::Json::CharReaderBuilder reader;
            JSONCPP_STRING errs;
            if (!::Json::parseFromStream(reader, stream, &body, &errs) || !errs.empty()) {
                ::Json::Value errBody;
                errBody["success"] = false;
                errBody["error"] = "Invalid JSON body";
                auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                callback(response);
                return;
            }
        }

        // Validate operations array
        if (!body.isMember("operations") || !body["operations"].isArray()) {
            ::Json::Value errBody;
            errBody["success"] = false;
            errBody["error"] = "Request body must contain an 'operations' array";
            auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
            response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
            callback(response);
            return;
        }

        const auto& operations = body["operations"];
        if (operations.empty()) {
            ::Json::Value errBody;
            errBody["success"] = false;
            errBody["error"] = "Operations array must not be empty";
            auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
            response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
            callback(response);
            return;
        }

        // Begin transaction
        auto txResult = client_.beginTransaction();
        if (!txResult.isOk()) {
            ::Json::Value errBody;
            errBody["success"] = false;
            errBody["error"] = "Failed to begin transaction";
            auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
            response->setStatusCode(drogon::HttpStatusCode::k500InternalServerError);
            callback(response);
            return;
        }

        ::Json::Value results(::Json::arrayValue);

        for (::Json::ArrayIndex i = 0; i < operations.size(); ++i) {
            const auto& op = operations[i];

            if (!op.isObject()) {
                client_.rollbackTransaction();
                ::Json::Value errBody;
                errBody["success"] = false;
                errBody["error"] = "Operation " + std::to_string(i) + " must be an object";
                auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                callback(response);
                return;
            }

            // Validate required fields
            if (!op.isMember("action") || !op["action"].isString()) {
                client_.rollbackTransaction();
                ::Json::Value errBody;
                errBody["success"] = false;
                errBody["error"] = "Operation " + std::to_string(i) + " missing required 'action' field";
                auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                callback(response);
                return;
            }

            if (!op.isMember("entity") || !op["entity"].isString()) {
                client_.rollbackTransaction();
                ::Json::Value errBody;
                errBody["success"] = false;
                errBody["error"] = "Operation " + std::to_string(i) + " missing required 'entity' field";
                auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                callback(response);
                return;
            }

            std::string action = op["action"].asString();
            std::string entity = op["entity"].asString();

            // Build the entity name consistent with how routes construct it:
            // CrudHandler uses route.entity which comes from parseRoute() on the full path
            // For batch, we use the entity name from the operation directly
            // The entity name from the route is just the URL segment (e.g., "users")

            ::Json::Value opResult;
            opResult["operation"] = static_cast<int>(i);
            opResult["action"] = action;
            opResult["entity"] = entity;

            if (action == "create") {
                if (!op.isMember("data") || !op["data"].isObject()) {
                    client_.rollbackTransaction();
                    ::Json::Value errBody;
                    errBody["success"] = false;
                    errBody["error"] = "Operation " + std::to_string(i) +
                                       " (create): missing required 'data' object";
                    auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                    response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                    callback(response);
                    return;
                }

                nlohmann::json nData = jsoncpp_to_nlohmann(op["data"]);

                // Inject tenantId if not already present
                if (!tenant.empty() && !nData.contains("tenantId")) {
                    nData["tenantId"] = tenant;
                }

                auto result = client_.createEntity(entity, nData);
                if (!result.isOk()) {
                    client_.rollbackTransaction();
                    ::Json::Value errBody;
                    errBody["success"] = false;
                    errBody["error"] = "Operation " + std::to_string(i) +
                                       " (create on " + entity + ") failed: " + result.error().what();
                    auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                    response->setStatusCode(static_cast<drogon::HttpStatusCode>(
                        static_cast<int>(result.error().code())));
                    callback(response);
                    return;
                }

                opResult["data"] = nlohmann_to_jsoncpp(result.value());

            } else if (action == "update") {
                if (!op.isMember("id") || !op["id"].isString() || op["id"].asString().empty()) {
                    client_.rollbackTransaction();
                    ::Json::Value errBody;
                    errBody["success"] = false;
                    errBody["error"] = "Operation " + std::to_string(i) +
                                       " (update): missing required 'id' field";
                    auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                    response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                    callback(response);
                    return;
                }

                if (!op.isMember("data") || !op["data"].isObject()) {
                    client_.rollbackTransaction();
                    ::Json::Value errBody;
                    errBody["success"] = false;
                    errBody["error"] = "Operation " + std::to_string(i) +
                                       " (update): missing required 'data' object";
                    auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                    response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                    callback(response);
                    return;
                }

                std::string id = op["id"].asString();
                nlohmann::json nData = jsoncpp_to_nlohmann(op["data"]);

                auto result = client_.updateEntity(entity, id, nData);
                if (!result.isOk()) {
                    client_.rollbackTransaction();
                    ::Json::Value errBody;
                    errBody["success"] = false;
                    errBody["error"] = "Operation " + std::to_string(i) +
                                       " (update on " + entity + " id=" + id + ") failed: " +
                                       result.error().what();
                    auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                    response->setStatusCode(static_cast<drogon::HttpStatusCode>(
                        static_cast<int>(result.error().code())));
                    callback(response);
                    return;
                }

                opResult["id"] = id;
                opResult["data"] = nlohmann_to_jsoncpp(result.value());

            } else if (action == "delete") {
                if (!op.isMember("id") || !op["id"].isString() || op["id"].asString().empty()) {
                    client_.rollbackTransaction();
                    ::Json::Value errBody;
                    errBody["success"] = false;
                    errBody["error"] = "Operation " + std::to_string(i) +
                                       " (delete): missing required 'id' field";
                    auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                    response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                    callback(response);
                    return;
                }

                std::string id = op["id"].asString();

                auto result = client_.deleteEntity(entity, id);
                if (!result.isOk()) {
                    client_.rollbackTransaction();
                    ::Json::Value errBody;
                    errBody["success"] = false;
                    errBody["error"] = "Operation " + std::to_string(i) +
                                       " (delete on " + entity + " id=" + id + ") failed: " +
                                       result.error().what();
                    auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                    response->setStatusCode(static_cast<drogon::HttpStatusCode>(
                        static_cast<int>(result.error().code())));
                    callback(response);
                    return;
                }

                opResult["id"] = id;
                opResult["deleted"] = true;

            } else {
                client_.rollbackTransaction();
                ::Json::Value errBody;
                errBody["success"] = false;
                errBody["error"] = "Operation " + std::to_string(i) +
                                   ": unsupported action '" + action +
                                   "' (valid: create, update, delete)";
                auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
                response->setStatusCode(drogon::HttpStatusCode::k400BadRequest);
                callback(response);
                return;
            }

            results.append(opResult);
        }

        // Commit transaction
        auto commitResult = client_.commitTransaction();
        if (!commitResult.isOk()) {
            ::Json::Value errBody;
            errBody["success"] = false;
            errBody["error"] = "Failed to commit transaction";
            auto response = drogon::HttpResponse::newHttpJsonResponse(errBody);
            response->setStatusCode(drogon::HttpStatusCode::k500InternalServerError);
            callback(response);
            return;
        }

        ::Json::Value responseBody;
        responseBody["success"] = true;
        responseBody["operations"] = static_cast<int>(operations.size());
        responseBody["results"] = results;
        callback(build_json_response(responseBody));

    } catch (const std::exception& e) {
        spdlog::error("BatchRouteHandler exception: {}", e.what());
        sendErrorResponse(std::move(callback), "Internal server error");
    }
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
