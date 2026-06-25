#include "bulk_handler.hpp"
#include "json_convert.hpp"
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {
namespace rpc {

void BulkHandler::handleBulkCreate(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("BulkHandler::handleBulkCreate: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Validate body is an array
        if (!body.isArray()) {
            ResponseFormatter::sendError(
                "Bulk create requires an array of resources",
                400,
                send_error
            );
            return;
        }

        if (body.empty()) {
            ResponseFormatter::sendError(
                "Bulk create requires a non-empty array",
                400,
                send_error
            );
            return;
        }

        // Begin transaction
        auto txResult = client.beginTransaction();
        if (!txResult.isOk()) {
            ResponseFormatter::sendError("Failed to begin transaction", 500, send_error);
            return;
        }

        int inserted = 0;
        ::Json::Value results(::Json::arrayValue);

        for (const auto& item : body) {
            // Convert jsoncpp to nlohmann::json
            nlohmann::json nItem = jsoncpp_to_nlohmann(item);

            // Inject tenantId if not already present
            if (!route.tenant.empty() && !nItem.contains("tenantId")) {
                nItem["tenantId"] = route.tenant;
            }

            auto result = client.createEntity(route.entity, nItem);
            if (!result.isOk()) {
                client.rollbackTransaction();
                ResponseFormatter::sendError(
                    "Bulk create failed at item " + std::to_string(inserted) + ": " + result.error().what(),
                    400, send_error);
                return;
            }

            // Convert result back to jsoncpp
            results.append(nlohmann_to_jsoncpp(result.value()));
            inserted++;
        }

        auto commitResult = client.commitTransaction();
        if (!commitResult.isOk()) {
            ResponseFormatter::sendError("Failed to commit transaction", 500, send_error);
            return;
        }

        ::Json::Value response;
        response["success"] = true;
        response["inserted"] = inserted;
        response["data"] = results;
        send_success(response);
    }, send_error);
}

void BulkHandler::handleBulkUpdate(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("BulkHandler::handleBulkUpdate: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Validate body is an array
        if (!body.isArray()) {
            ResponseFormatter::sendError(
                "Bulk update requires an array of updates",
                400,
                send_error
            );
            return;
        }

        if (body.empty()) {
            ResponseFormatter::sendError(
                "Bulk update requires a non-empty array",
                400,
                send_error
            );
            return;
        }

        // Begin transaction
        auto txResult = client.beginTransaction();
        if (!txResult.isOk()) {
            ResponseFormatter::sendError("Failed to begin transaction", 500, send_error);
            return;
        }

        int updated = 0;
        ::Json::Value results(::Json::arrayValue);

        for (const auto& item : body) {
            // Each item must have "id" and "data"
            if (!item.isObject() || !item.isMember("id") || !item.isMember("data")) {
                client.rollbackTransaction();
                ResponseFormatter::sendError(
                    "Bulk update item " + std::to_string(updated) +
                    " must be an object with 'id' and 'data' fields",
                    400, send_error);
                return;
            }

            std::string itemId = item["id"].asString();
            if (itemId.empty()) {
                client.rollbackTransaction();
                ResponseFormatter::sendError(
                    "Bulk update item " + std::to_string(updated) + " has empty 'id'",
                    400, send_error);
                return;
            }

            // Convert data to nlohmann::json
            nlohmann::json nData = jsoncpp_to_nlohmann(item["data"]);

            auto result = client.updateEntity(route.entity, itemId, nData);
            if (!result.isOk()) {
                client.rollbackTransaction();
                ResponseFormatter::sendError(
                    "Bulk update failed at item " + std::to_string(updated) +
                    " (id=" + itemId + "): " + result.error().what(),
                    400, send_error);
                return;
            }

            results.append(nlohmann_to_jsoncpp(result.value()));
            updated++;
        }

        auto commitResult = client.commitTransaction();
        if (!commitResult.isOk()) {
            ResponseFormatter::sendError("Failed to commit transaction", 500, send_error);
            return;
        }

        ::Json::Value response;
        response["success"] = true;
        response["updated"] = updated;
        response["data"] = results;
        send_success(response);
    }, send_error);
}

void BulkHandler::handleBulkDelete(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("BulkHandler::handleBulkDelete: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Validate body is an array
        if (!body.isArray()) {
            ResponseFormatter::sendError(
                "Bulk delete requires an array of IDs",
                400,
                send_error
            );
            return;
        }

        if (body.empty()) {
            ResponseFormatter::sendError(
                "Bulk delete requires a non-empty array",
                400,
                send_error
            );
            return;
        }

        // Begin transaction
        auto txResult = client.beginTransaction();
        if (!txResult.isOk()) {
            ResponseFormatter::sendError("Failed to begin transaction", 500, send_error);
            return;
        }

        int deleted = 0;
        ::Json::Value deletedIds(::Json::arrayValue);

        for (const auto& idVal : body) {
            if (!idVal.isString()) {
                client.rollbackTransaction();
                ResponseFormatter::sendError(
                    "Bulk delete item " + std::to_string(deleted) +
                    " must be a string ID",
                    400, send_error);
                return;
            }

            std::string itemId = idVal.asString();
            if (itemId.empty()) {
                client.rollbackTransaction();
                ResponseFormatter::sendError(
                    "Bulk delete item " + std::to_string(deleted) + " has empty ID",
                    400, send_error);
                return;
            }

            auto result = client.deleteEntity(route.entity, itemId);
            if (!result.isOk()) {
                client.rollbackTransaction();
                ResponseFormatter::sendError(
                    "Bulk delete failed at item " + std::to_string(deleted) +
                    " (id=" + itemId + "): " + result.error().what(),
                    400, send_error);
                return;
            }

            deletedIds.append(itemId);
            deleted++;
        }

        auto commitResult = client.commitTransaction();
        if (!commitResult.isOk()) {
            ResponseFormatter::sendError("Failed to commit transaction", 500, send_error);
            return;
        }

        ::Json::Value response;
        response["success"] = true;
        response["deleted"] = deleted;
        response["ids"] = deletedIds;
        send_success(response);
    }, send_error);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
