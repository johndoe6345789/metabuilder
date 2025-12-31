#include "rpc_user_actions.hpp"
#include "server_helpers.hpp"

#include "dbal/core/errors.hpp"

namespace dbal {
namespace daemon {
namespace rpc {

void handle_user_list(Client& client,
                      const Json::Value& options,
                      ResponseSender send_success,
                      ErrorSender send_error) {
    auto list_options = list_options_from_json(options);
    auto result = client.listUsers(list_options);
    if (!result.isOk()) {
        const auto& error = result.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }
    send_success(list_response_value(result.value(), list_options));
}

void handle_user_read(Client& client,
                      const std::string& id,
                      ResponseSender send_success,
                      ErrorSender send_error) {
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
    send_success(user_to_json(result.value()));
}

void handle_user_create(Client& client,
                        const Json::Value& payload,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    const auto username = payload.get("username", "").asString();
    const auto email = payload.get("email", "").asString();
    if (username.empty() || email.empty()) {
        send_error("Username and email are required for creation", 400);
        return;
    }

    CreateUserInput input;
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
                        const std::string& id,
                        const Json::Value& payload,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    if (id.empty()) {
        send_error("ID is required for updates", 400);
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
                        const std::string& id,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    if (id.empty()) {
        send_error("ID is required for delete operations", 400);
        return;
    }

    auto result = client.deleteUser(id);
    if (!result.isOk()) {
        const auto& error = result.error();
        send_error(error.what(), static_cast<int>(error.code()));
        return;
    }

    Json::Value body;
    body["deleted"] = result.value();
    send_success(body);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
