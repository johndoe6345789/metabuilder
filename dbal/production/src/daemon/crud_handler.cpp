#include "crud_handler.hpp"
#include "json_convert.hpp"
#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>

namespace dbal {
namespace daemon {
namespace rpc {

void CrudHandler::handleCreate(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("CrudHandler::handleCreate: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Convert jsoncpp body to nlohmann::json
        nlohmann::json data = jsoncpp_to_nlohmann(body);

        // Inject tenantId if not already present
        if (!route.tenant.empty() && !data.contains("tenantId")) {
            data["tenantId"] = route.tenant;
        }

        auto result = client.createEntity(route.entity, data);
        if (!result.isOk()) {
            const auto& error = result.error();
            send_error(error.what(), static_cast<int>(error.code()));
            return;
        }

        send_success(nlohmann_to_jsoncpp(result.value()));
    }, send_error);
}

void CrudHandler::handleRead(
    Client& client,
    const RouteInfo& route,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("CrudHandler::handleRead: tenant='{}', entity='{}', id='{}'",
                  route.tenant, route.entity, route.id);

    ResponseFormatter::withExceptionHandling([&]() {
        auto result = client.getEntity(route.entity, route.id);
        if (!result.isOk()) {
            const auto& error = result.error();
            send_error(error.what(), static_cast<int>(error.code()));
            return;
        }

        // Verify tenant isolation
        const auto& record = result.value();
        if (record.contains("tenantId") && record["tenantId"].is_string()) {
            if (!route.tenant.empty() && record["tenantId"].get<std::string>() != route.tenant) {
                send_error(route.entity + " not found", 404);
                return;
            }
        }

        send_success(nlohmann_to_jsoncpp(record));
    }, send_error);
}

void CrudHandler::handleUpdate(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("CrudHandler::handleUpdate: tenant='{}', entity='{}', id='{}'",
                  route.tenant, route.entity, route.id);

    ResponseFormatter::withExceptionHandling([&]() {
        if (route.id.empty()) {
            ResponseFormatter::sendError(
                "ID is required for update operations",
                400,
                send_error
            );
            return;
        }

        // Verify entity exists and belongs to tenant
        auto existing = client.getEntity(route.entity, route.id);
        if (!existing.isOk()) {
            const auto& error = existing.error();
            send_error(error.what(), static_cast<int>(error.code()));
            return;
        }

        const auto& existingRecord = existing.value();
        if (existingRecord.contains("tenantId") && existingRecord["tenantId"].is_string()) {
            if (!route.tenant.empty() && existingRecord["tenantId"].get<std::string>() != route.tenant) {
                send_error(route.entity + " not found", 404);
                return;
            }
        }

        // Convert body and update
        nlohmann::json data = jsoncpp_to_nlohmann(body);

        if (data.empty()) {
            ResponseFormatter::sendError(
                "At least one update field must be provided",
                400,
                send_error
            );
            return;
        }

        auto result = client.updateEntity(route.entity, route.id, data);
        if (!result.isOk()) {
            const auto& error = result.error();
            send_error(error.what(), static_cast<int>(error.code()));
            return;
        }

        send_success(nlohmann_to_jsoncpp(result.value()));
    }, send_error);
}

void CrudHandler::handleDelete(
    Client& client,
    const RouteInfo& route,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("CrudHandler::handleDelete: tenant='{}', entity='{}', id='{}'",
                  route.tenant, route.entity, route.id);

    ResponseFormatter::withExceptionHandling([&]() {
        if (route.id.empty()) {
            ResponseFormatter::sendError(
                "ID is required for delete operations",
                400,
                send_error
            );
            return;
        }

        // Verify entity exists and belongs to tenant
        auto existing = client.getEntity(route.entity, route.id);
        if (!existing.isOk()) {
            const auto& error = existing.error();
            send_error(error.what(), static_cast<int>(error.code()));
            return;
        }

        const auto& existingRecord = existing.value();
        if (existingRecord.contains("tenantId") && existingRecord["tenantId"].is_string()) {
            if (!route.tenant.empty() && existingRecord["tenantId"].get<std::string>() != route.tenant) {
                send_error(route.entity + " not found", 404);
                return;
            }
        }

        auto result = client.deleteEntity(route.entity, route.id);
        if (!result.isOk()) {
            const auto& error = result.error();
            send_error(error.what(), static_cast<int>(error.code()));
            return;
        }

        ::Json::Value responseBody;
        responseBody["deleted"] = result.value();
        send_success(responseBody);
    }, send_error);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
