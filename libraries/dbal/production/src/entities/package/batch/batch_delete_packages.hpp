/**
 * @file batch_delete_packages.hpp
 * @brief Batch delete packages operation
 */

#pragma once

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../crud/delete_package.hpp"

namespace dbal {
namespace entities {

/**
 * @brief Batch delete multiple packages
 */
inline Result<int> batchDeletePackages(InMemoryStore& store, const std::vector<std::string>& ids) {
    if (ids.empty()) {
        return Result<int>(0);
    }

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = deletePackage(store, id);
        if (result.isError()) {
            return result.error();
        }
        deleted++;
    }

    return Result<int>(deleted);
}

} // namespace entities
} // namespace dbal
