/**
 * @file delete_package.hpp
 * @brief Delete package operation
 */
#ifndef DBAL_DELETE_PACKAGE_HPP
#define DBAL_DELETE_PACKAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/package_validation.hpp"

namespace dbal {
namespace entities {
namespace package {

/**
 * Delete a package by ID
 */
inline Result<bool> remove(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto it = store.packages.find(id);
    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    store.package_keys.erase(validation::packageKey(it->second.packageId));
    store.packages.erase(it);

    return Result<bool>(true);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
