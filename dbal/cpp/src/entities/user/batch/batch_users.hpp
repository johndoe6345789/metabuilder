/**
 * @file batch_users.hpp
 * @brief Batch user operations (create, update, delete)
 */
#ifndef DBAL_BATCH_USERS_HPP
#define DBAL_BATCH_USERS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../crud/create_user.hpp"
#include "../crud/update_user.hpp"
#include "../crud/delete_user.hpp"

namespace dbal {
namespace entities {
namespace user {

/**
 * Batch create multiple users (with rollback on error)
 */
inline Result<int> batchCreate(InMemoryStore& store, const std::vector<CreateUserInput>& inputs) {
    if (inputs.empty()) return Result<int>(0);

    std::vector<std::string> created_ids;
    for (const auto& input : inputs) {
        auto result = create(store, input);
        if (result.isError()) {
            for (const auto& id : created_ids) {
                store.users.erase(id);
            }
            return result.error();
        }
        created_ids.push_back(result.value().id);
    }
    return Result<int>(static_cast<int>(created_ids.size()));
}

/**
 * Batch update multiple users
 */
inline Result<int> batchUpdate(InMemoryStore& store, const std::vector<UpdateUserBatchItem>& updates) {
    if (updates.empty()) return Result<int>(0);

    int updated = 0;
    for (const auto& item : updates) {
        auto result = update(store, item.id, item.data);
        if (result.isError()) return result.error();
        updated++;
    }
    return Result<int>(updated);
}

/**
 * Batch delete multiple users
 */
inline Result<int> batchDelete(InMemoryStore& store, const std::vector<std::string>& ids) {
    if (ids.empty()) return Result<int>(0);

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = remove(store, id);
        if (result.isError()) return result.error();
        deleted++;
    }
    return Result<int>(deleted);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
