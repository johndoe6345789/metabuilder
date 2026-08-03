/**
 * @file client_user_ops.cpp
 * @brief DBAL Client user entity operations.
 *
 * All operations go through the generic, schema-driven adapter_ (same
 * pattern as Credential in client_misc_ops.cpp), NOT the legacy
 * entities::user::*(getStore(), ...) in-memory path. That path used a
 * process-wide InMemoryStore singleton shared across every Client instance
 * -- never persisted to the configured database, and its list() filter
 * silently ignored any key other than "tenantId"/"role" (so a "username"
 * filter with limit=1 could return an arbitrary user's row). The public
 * HTTP REST API (crud_handler.cpp, entity_route_handler_crud.cpp,
 * list_handler.cpp) already calls Client::createEntity/listEntities/etc.
 * directly against adapter_ for entity="User", so it was never affected --
 * only the typed convenience methods here (used by rpc_user_actions.cpp
 * and, via getUserRoleByUsername in client_misc_ops.cpp, by the OIDC role
 * claim) were on the broken path. The backing store is therefore already
 * "abstracted and env var" in the sense that matters: it's whatever
 * adapter_ was constructed from (DBAL_ADAPTER / DATABASE_URL), exactly
 * like every other entity.
 */
#include "dbal/client.hpp"
#include <algorithm>
#include <cctype>
#include <chrono>

namespace dbal {

namespace {

Timestamp epochMsToTimestamp(int64_t ms) {
    return Timestamp(std::chrono::milliseconds(ms));
}

int64_t timestampToEpochMs(const Timestamp& ts) {
    return std::chrono::duration_cast<std::chrono::milliseconds>(ts.time_since_epoch()).count();
}

User userFromJson(const nlohmann::json& j) {
    User user;
    user.id = j.value("id", std::string());
    user.username = j.value("username", std::string());
    user.email = j.value("email", std::string());
    user.role = j.value("role", std::string());
    if (j.contains("profilePicture") && !j["profilePicture"].is_null()) {
        user.profilePicture = j["profilePicture"].get<std::string>();
    }
    if (j.contains("bio") && !j["bio"].is_null()) {
        user.bio = j["bio"].get<std::string>();
    }
    if (j.contains("createdAt") && !j["createdAt"].is_null()) {
        user.createdAt = epochMsToTimestamp(j["createdAt"].get<int64_t>());
    }
    if (j.contains("tenantId") && !j["tenantId"].is_null()) {
        user.tenantId = j["tenantId"].get<std::string>();
    }
    if (j.contains("isInstanceOwner") && !j["isInstanceOwner"].is_null()) {
        user.isInstanceOwner = j["isInstanceOwner"].get<bool>();
    }
    if (j.contains("passwordChangeTimestamp") && !j["passwordChangeTimestamp"].is_null()) {
        user.passwordChangeTimestamp = epochMsToTimestamp(j["passwordChangeTimestamp"].get<int64_t>());
    }
    if (j.contains("firstLogin") && !j["firstLogin"].is_null()) {
        user.firstLogin = j["firstLogin"].get<bool>();
    }
    return user;
}

nlohmann::json createUserToJson(const CreateUserInput& input) {
    nlohmann::json data;
    data["username"] = input.username;
    data["email"] = input.email;
    // Schema declares role required with default "user"; callers (e.g.
    // rpc_user_actions.cpp) leave CreateUserInput::role default-constructed
    // (empty) when the caller didn't specify one.
    data["role"] = input.role.empty() ? std::string("user") : input.role;
    if (input.profilePicture) data["profilePicture"] = *input.profilePicture;
    if (input.bio) data["bio"] = *input.bio;
    if (input.tenantId) data["tenantId"] = *input.tenantId;
    if (input.isInstanceOwner) data["isInstanceOwner"] = *input.isInstanceOwner;
    if (input.passwordChangeTimestamp) {
        data["passwordChangeTimestamp"] = timestampToEpochMs(*input.passwordChangeTimestamp);
    }
    if (input.firstLogin) data["firstLogin"] = *input.firstLogin;
    return data;
}

nlohmann::json updateUserToJson(const UpdateUserInput& input) {
    nlohmann::json data;
    if (input.username) data["username"] = *input.username;
    if (input.email) data["email"] = *input.email;
    if (input.role) data["role"] = *input.role;
    if (input.profilePicture) data["profilePicture"] = *input.profilePicture;
    if (input.bio) data["bio"] = *input.bio;
    if (input.tenantId) data["tenantId"] = *input.tenantId;
    if (input.isInstanceOwner) data["isInstanceOwner"] = *input.isInstanceOwner;
    if (input.passwordChangeTimestamp) {
        data["passwordChangeTimestamp"] = timestampToEpochMs(*input.passwordChangeTimestamp);
    }
    if (input.firstLogin) data["firstLogin"] = *input.firstLogin;
    return data;
}

std::string toLowerAscii(const std::string& value) {
    std::string lowered(value.size(), '\0');
    std::transform(value.begin(), value.end(), lowered.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return lowered;
}

bool containsInsensitive(const std::string& haystack, const std::string& needle) {
    return toLowerAscii(haystack).find(toLowerAscii(needle)) != std::string::npos;
}

} // namespace

Result<User> Client::createUser(const CreateUserInput& input) {
    auto result = adapter_->create("User", createUserToJson(input));
    if (result.isError()) return result.error();
    return userFromJson(result.value());
}

Result<User> Client::getUser(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    auto result = adapter_->read("User", id);
    if (result.isError()) return result.error();
    return userFromJson(result.value());
}

Result<User> Client::updateUser(const std::string& id, const UpdateUserInput& input) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    auto result = adapter_->update("User", id, updateUserToJson(input));
    if (result.isError()) return result.error();
    return userFromJson(result.value());
}

Result<bool> Client::deleteUser(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    return adapter_->remove("User", id);
}

Result<std::vector<User>> Client::listUsers(const ListOptions& options) {
    auto result = adapter_->list("User", options);
    if (result.isError()) return result.error();

    std::vector<User> users;
    users.reserve(result.value().items.size());
    for (const auto& item : result.value().items) {
        users.push_back(userFromJson(item));
    }
    return users;
}

Result<int> Client::batchCreateUsers(const std::vector<CreateUserInput>& inputs) {
    if (inputs.empty()) return 0;

    int created = 0;
    for (const auto& input : inputs) {
        auto result = createUser(input);
        if (result.isError()) return result.error();
        ++created;
    }
    return created;
}

Result<int> Client::batchUpdateUsers(const std::vector<UpdateUserBatchItem>& updates) {
    if (updates.empty()) return 0;

    int updated = 0;
    for (const auto& item : updates) {
        auto result = updateUser(item.id, item.data);
        if (result.isError()) return result.error();
        ++updated;
    }
    return updated;
}

Result<int> Client::batchDeleteUsers(const std::vector<std::string>& ids) {
    if (ids.empty()) return 0;

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = deleteUser(id);
        if (result.isError()) return result.error();
        ++deleted;
    }
    return deleted;
}

Result<std::vector<User>> Client::searchUsers(const std::string& query, int limit) {
    if (query.empty()) {
        return Error::validationError("search query is required");
    }

    // Adapter has no generic full-text search op; fetch broadly and filter
    // client-side, same substring-match semantics as the old implementation.
    ListOptions options;
    options.limit = 10000;
    auto all = listUsers(options);
    if (all.isError()) return all.error();

    std::vector<User> matches;
    for (const auto& user : all.value()) {
        if (containsInsensitive(user.username, query) || containsInsensitive(user.email, query)) {
            matches.push_back(user);
            if (limit > 0 && static_cast<int>(matches.size()) >= limit) break;
        }
    }
    return matches;
}

Result<int> Client::countUsers(const std::optional<std::string>& role) {
    ListOptions options;
    options.limit = 1;
    if (role.has_value()) options.filter["role"] = *role;
    auto result = adapter_->list("User", options);
    if (result.isError()) return result.error();
    return result.value().total;
}

Result<int> Client::updateManyUsers(const std::map<std::string, std::string>& filter,
                                   const UpdateUserInput& updates) {
    if (filter.empty()) {
        return Error::validationError("filter is required for bulk updates");
    }
    nlohmann::json filterJson = filter;
    return adapter_->updateMany("User", filterJson, updateUserToJson(updates));
}

Result<int> Client::deleteManyUsers(const std::map<std::string, std::string>& filter) {
    if (filter.empty()) {
        return Error::validationError("filter is required for bulk deletes");
    }
    nlohmann::json filterJson = filter;
    return adapter_->deleteMany("User", filterJson);
}

} // namespace dbal
