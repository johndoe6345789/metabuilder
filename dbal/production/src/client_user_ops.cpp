/**
 * @file client_user_ops.cpp
 * @brief DBAL Client user entity operations.
 *
 * This file contains all user-related CRUD operations:
 * - Basic CRUD (create, get, update, delete, list)
 * - Batch operations (batchCreate, batchUpdate, batchDelete)
 * - Query operations (search, count)
 * - Bulk update/delete (updateMany, deleteMany)
 */
#include "dbal/client.hpp"
#include "entities/index.hpp"
#include "store/in_memory_store.hpp"

namespace dbal {

Result<User> Client::createUser(const CreateUserInput& input) {
    return entities::user::create(getStore(), input);
}

Result<User> Client::getUser(const std::string& id) {
    return entities::user::get(getStore(), id);
}

Result<User> Client::updateUser(const std::string& id, const UpdateUserInput& input) {
    return entities::user::update(getStore(), id, input);
}

Result<bool> Client::deleteUser(const std::string& id) {
    return entities::user::remove(getStore(), id);
}

Result<std::vector<User>> Client::listUsers(const ListOptions& options) {
    return entities::user::list(getStore(), options);
}

Result<int> Client::batchCreateUsers(const std::vector<CreateUserInput>& inputs) {
    return entities::user::batchCreate(getStore(), inputs);
}

Result<int> Client::batchUpdateUsers(const std::vector<UpdateUserBatchItem>& updates) {
    return entities::user::batchUpdate(getStore(), updates);
}

Result<int> Client::batchDeleteUsers(const std::vector<std::string>& ids) {
    return entities::user::batchDelete(getStore(), ids);
}

Result<std::vector<User>> Client::searchUsers(const std::string& query, int limit) {
    return entities::user::search(getStore(), query, limit);
}

Result<int> Client::countUsers(const std::optional<std::string>& role) {
    return entities::user::count(getStore(), role);
}

Result<int> Client::updateManyUsers(const std::map<std::string, std::string>& filter,
                                   const UpdateUserInput& updates) {
    return entities::user::updateMany(getStore(), filter, updates);
}

Result<int> Client::deleteManyUsers(const std::map<std::string, std::string>& filter) {
    return entities::user::deleteMany(getStore(), filter);
}

} // namespace dbal
