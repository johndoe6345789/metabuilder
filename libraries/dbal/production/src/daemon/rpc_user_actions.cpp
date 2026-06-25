#include "rpc_user_actions.hpp"
#include "server_helpers.hpp"

#include "dbal/core/errors.hpp"

namespace dbal {
namespace daemon {
namespace rpc {

void handle_user_list(Client& client,
                      const std::string& tenantId,
                      const ::Json::Value& options,
                      ResponseSender send_success,
                      ErrorSender send_error) {
    if (tenantId.empty()) {
        send_error("Tenant ID is required", 400);
        return;
    }

    auto list_options = list_options_from_json(options);
    list_options.filter["tenantId"] = tenantId;
    auto result = client.listUsers(list_options);
    if (!result.isOk()) {
        const auto& error = result.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }
    send_success(list_response_value(result.value(), list_options));
}

void handle_user_read(Client& client,
                      const std::string& tenantId,
                      const std::string& id,
                      ResponseSender send_success,
                      ErrorSender send_error) {
    if (tenantId.empty()) {
        send_error("Tenant ID is required", 400);
        return;
    }
    if (id.empty()) {
        send_error("ID is required for read operations", 400);
        return;
    }
    auto result = client.getUser(id);
    if (!result.isOk()) {
        const auto& error = result.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }
    const auto& user = result.value();
    if (user.tenantId != tenantId) {
        send_error("User not found", 404);
        return;
    }
    send_success(user_to_json(user));
}

void handle_user_create(Client& client,
                        const std::string& tenantId,
                        const ::Json::Value& payload,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    if (tenantId.empty()) {
        send_error("Tenant ID is required", 400);
        return;
    }
    const auto username = payload.get("username", "").asString();
    const auto email = payload.get("email", "").asString();
    if (username.empty() || email.empty()) {
        send_error("Username and email are required for creation", 400);
        return;
    }

    CreateUserInput input;
    input.tenantId = tenantId;
    input.username = username;
    input.email = email;
    if (payload.isMember("role") && payload["role"].isString()) {
        input.role = normalize_role(payload["role"].asString());
    }

    auto result = client.createUser(input);
    if (!result.isOk()) {
        const auto& error = result.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }

    send_success(user_to_json(result.value()));
}

void handle_user_update(Client& client,
                        const std::string& tenantId,
                        const std::string& id,
                        const ::Json::Value& payload,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    if (tenantId.empty()) {
        send_error("Tenant ID is required", 400);
        return;
    }
    if (id.empty()) {
        send_error("ID is required for updates", 400);
        return;
    }

    auto existing = client.getUser(id);
    if (!existing.isOk()) {
        const auto& error = existing.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }
    if (existing.value().tenantId != tenantId) {
        send_error("User not found", 404);
        return;
    }

    UpdateUserInput updates;
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
        send_error("At least one update field must be provided", 400);
        return;
    }

    auto result = client.updateUser(id, updates);
    if (!result.isOk()) {
        const auto& error = result.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }

    send_success(user_to_json(result.value()));
}

void handle_user_delete(Client& client,
                        const std::string& tenantId,
                        const std::string& id,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    if (tenantId.empty()) {
        send_error("Tenant ID is required", 400);
        return;
    }
    if (id.empty()) {
        send_error("ID is required for delete operations", 400);
        return;
    }

    auto existing = client.getUser(id);
    if (!existing.isOk()) {
        const auto& error = existing.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }
    if (existing.value().tenantId != tenantId) {
        send_error("User not found", 404);
        return;
    }

    auto result = client.deleteUser(id);
    if (!result.isOk()) {
        const auto& error = result.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }

    ::Json::Value body;
    body["deleted"] = result.value();
    send_success(body);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
