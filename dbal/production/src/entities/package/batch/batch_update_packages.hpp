/**
 * @file batch_update_packages.hpp
 * @brief Batch update packages operation
 */

#pragma once

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../crud/update_package.hpp"

namespace dbal {
namespace entities {

/**
 * @brief Batch update multiple packages
 */
inline Result<int> batchUpdatePackages(InMemoryStore& store, const std::vector<UpdatePackageBatchItem>& updates) {
    if (updates.empty()) {
        return Result<int>(0);
    }

    int updated = 0;
    for (const auto& item : updates) {
        auto result = updatePackage(store, item.id, item.data);
        if (result.isError()) {
            return result.error();
        }
        updated++;
    }

    return Result<int>(updated);
}

} // namespace entities
} // namespace dbal
