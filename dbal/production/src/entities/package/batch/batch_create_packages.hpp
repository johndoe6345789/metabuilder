/**
 * @file batch_create_packages.hpp
 * @brief Batch create packages operation
 */

#pragma once

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"
#include "create_package.hpp"
#include "../validation/package_validation.hpp"

namespace dbal {
namespace entities {

/**
 * @brief Batch create multiple packages
 */
inline Result<int> batchCreatePackages(InMemoryStore& store, const std::vector<CreatePackageInput>& inputs) {
    if (inputs.empty()) {
        return Result<int>(0);
    }

    std::vector<std::string> created_ids;
    for (const auto& input : inputs) {
        auto result = createPackage(store, input);
        if (result.isError()) {
            // Rollback on error
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

} // namespace entities
} // namespace dbal
