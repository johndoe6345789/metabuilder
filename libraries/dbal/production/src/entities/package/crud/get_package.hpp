/**
 * @file get_package.hpp
 * @brief Get package by ID or packageId operations
 */
#ifndef DBAL_GET_PACKAGE_HPP
#define DBAL_GET_PACKAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace package {

/**
 * Get a package by ID
 */
inline Result<InstalledPackage> get(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto it = store.packages.find(id);
    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    return Result<InstalledPackage>(it->second);
}

/**
 * Get a package by packageId key
 */
inline Result<InstalledPackage> getByPackageId(InMemoryStore& store, const std::string& package_key) {
    if (package_key.empty()) {
        return Error::validationError("Package key cannot be empty");
    }

    auto it = store.package_keys.find(package_key);
    if (it == store.package_keys.end()) {
        return Error::notFound("Package not found: " + package_key);
    }

    return get(store, it->second);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
