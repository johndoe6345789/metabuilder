/**
 * @file batch_packages.hpp
 * @brief Batch package operations (create, update, delete)
 */
#ifndef DBAL_BATCH_PACKAGES_HPP
#define DBAL_BATCH_PACKAGES_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/package_validation.hpp"
#include "../crud/create_package.hpp"
#include "../crud/update_package.hpp"
#include "../crud/delete_package.hpp"

namespace dbal {
namespace entities {
namespace package {

/**
 * Batch create multiple packages (with rollback on error)
 */
inline Result<int> batchCreate(InMemoryStore& store, const std::vector<CreatePackageInput>& inputs) {
    if (inputs.empty()) {
        return Result<int>(0);
    }

    std::vector<std::string> created_ids;
    for (const auto& input : inputs) {
        auto result = create(store, input);
        if (result.isError()) {
            for (const auto& id : created_ids) {
                auto it = store.packages.find(id);
                if (it != store.packages.end()) {
                    store.package_keys.erase(validation::packageKey(it->second.packageId));
                    store.packages.erase(it);
                }
            }
            return result.error();
        }
        created_ids.push_back(result.value().packageId);
    }

    return Result<int>(static_cast<int>(created_ids.size()));
}

/**
 * Batch update multiple packages
 */
inline Result<int> batchUpdate(InMemoryStore& store, const std::vector<UpdatePackageBatchItem>& updates) {
    if (updates.empty()) {
        return Result<int>(0);
    }

    int updated = 0;
    for (const auto& item : updates) {
        auto result = update(store, item.id, item.data);
        if (result.isError()) {
            return result.error();
        }
        updated++;
    }

    return Result<int>(updated);
}

/**
 * Batch delete multiple packages
 */
inline Result<int> batchDelete(InMemoryStore& store, const std::vector<std::string>& ids) {
    if (ids.empty()) {
        return Result<int>(0);
    }

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = remove(store, id);
        if (result.isError()) {
            return result.error();
        }
        deleted++;
    }

    return Result<int>(deleted);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
